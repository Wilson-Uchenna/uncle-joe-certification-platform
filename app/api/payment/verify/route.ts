import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import mongoose from "mongoose";
import { grantStudyResourcesAccess } from "@/lib/studyResources";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    await connectDB();

    const { reference, transactionId } = await req.json();

    if (!reference || !transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment reference or transaction ID",
        },
        { status: 400 },
      );
    }

    const payment = await Payment.findOne({ providerReference: reference });
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 },
      );
    }

    if (payment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
        message: "Already verified",
      });
    }

    console.log("Using key:", process.env.NEXT_PUBLIC_FLW_SECRET_KEY?.slice(0, 12) + "...");
    const fwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const fwJson = await fwRes.json();
    console.log("Flutterwave verify response:", JSON.stringify(fwJson, null, 2));

    const data = fwJson.data;
    const amountMatches = data?.amount >= payment.amount;
    const currencyMatches = data?.currency === payment.currency;
    const referenceMatches = data?.tx_ref === payment.providerReference;

    const verified =
      fwJson.status === "success" &&
      data?.status === "successful" &&
      referenceMatches &&
      amountMatches &&
      currencyMatches;

    if (
      fwJson.status === "success" &&
      data?.status === "successful" &&
      amountMatches &&
      currencyMatches
    ) {
      payment.status = "success";
      payment.paidAt = new Date();
      payment.providerTransactionId = data.id?.toString();
      await payment.save();

      if (payment.type === "registration") {
        await mongoose.connection
          .collection("user")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(payment.userId) },
            { $set: { hasPaid: true } },
          );
      }

      if (payment.type === "pdf_materials" || payment.type === "past_questions") {
        await grantStudyResourcesAccess({
          userId: payment.userId.toString(),
          type: payment.type,
          paymentReference: payment.providerReference,
        });
      }

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment verified",
      });
    }

    payment.status =
      data?.status === "successful"
        ? "failed"
        : "failed";
    await payment.save();

    return NextResponse.json({
      success: false,
      status: payment.status,
      message:
        data?.status === "successful"
          ? "Amount mismatch — payment flagged for review"
          : `Payment ${data?.status ?? "unverified"}`,
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 },
    );
  }
}