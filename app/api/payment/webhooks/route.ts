import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { grantResourceAccess } from "@/lib/resourceAccess";

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

    if (payment.type === "exam") {
      // Finalized the moment it's paid — non-refundable, no matter what
      // happens (or doesn't happen) with the exam attempt afterward.
      // /api/exam/start separately tracks whether this credit has been
      // claimed yet, via payment.examId.
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
  } else {
    payment.status = "failed";
    await payment.save();
  }
}