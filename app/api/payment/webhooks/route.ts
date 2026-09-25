import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { grantStudyResourcesAccess } from "@/lib/studyResources";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hash = req.headers.get("verif-hash");

    if (!hash) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    if (hash !== process.env.FLW_WEBHOOK_HASH) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event === "charge.completed") {
      processWebhook(data).catch(console.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}

async function processWebhook(data: any) {
  await connectDB();

  const { tx_ref: reference, status, id: transactionId } = data;
  const payment = await Payment.findOne({ providerReference: reference });
  if (!payment || payment.status === "success") return;

  if (status === "successful") {
    payment.status = "success";
    payment.paidAt = new Date();
    payment.providerTransactionId = transactionId?.toString();
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
        paymentReference: reference,
      });
    }
  } else {
    payment.status = "failed";
    await payment.save();
  }
}