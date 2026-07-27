import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { Exam } from "@/models/Exam";
import { verifyWebhookSignature } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event === "charge.success") {
      // Fire and forget
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

  const { reference, status, id: transactionId } = data;
  const payment = await Payment.findOne({ providerReference: reference });
  if (!payment || payment.status === "success") return;

  if (status === "success") {
    payment.status = "success";
    payment.paidAt = new Date();
    payment.providerTransactionId = transactionId?.toString();
    await payment.save();

    if (payment.type === "certificate" && payment.examId) {
      await Exam.findByIdAndUpdate(payment.examId, {
        certificatePaidAt: new Date(),
      });
    }
  } else {
    payment.status = status === "failed" ? "failed" : "abandoned";
    await payment.save();
  }
}