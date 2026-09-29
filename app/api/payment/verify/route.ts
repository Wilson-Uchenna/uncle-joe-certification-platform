// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { grantResourceAccess } from "@/lib/resourceAccess";

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
    const data = fwJson.data;
    const amountMatches = data?.amount >= payment.amount;
    const currencyMatches = data?.currency === payment.currency;

    if (
      fwJson.status === "success" &&
      data?.status === "successful" &&
      amountMatches &&
      currencyMatches
    ) {
      payment.status = "success";
      payment.paidAt = new Date();
      payment.providerTransactionId = data.id?.toString();
      if (payment.type === "exam") {
        payment.consumedAt = new Date();
      }
      await payment.save();

      if (payment.type === "explanation") {
        await grantResourceAccess({
          userId: payment.userId.toString(),
          resourceType: "explanation",
          resourceId: payment.metadata.explanationId,
          paymentReference: payment.providerReference,
        });
      }

      if (payment.type === "past_question") {
        await grantResourceAccess({
          userId: payment.userId.toString(),
          resourceType: "past_question",
          resourceId: payment.metadata.examId,
          paymentReference: payment.providerReference,
        });
      }

      // "exam" payments need no grant here — /api/exam/start finds and
      // consumes this Payment document directly when the exam is created

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment verified",
      });
    }

    payment.status = "failed";
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
