import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { Exam } from "@/models/Exam";
import { paystack } from "@/lib/paystack";
import { Result} from '@/models/ExamResults'

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { reference, examId } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "No reference" },
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

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
        message: "Already verified",
        examId: payment.examId,
      });
    }

    const data = await paystack.transaction.verify(reference);

    if (data.status === "success") {
      payment.status = "success";
      payment.paidAt = new Date();
      payment.providerTransactionId = data.id?.toString();
      await payment.save();

      if (payment.type === "certificate" && payment.examId) {
        await Exam.findByIdAndUpdate(payment.examId, {
          certificatePaidAt: new Date(),
        });
        await Result.findByIdAndUpdate(payment.examId, {
          
        })
      }

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment verified",
        examId: payment.examId,
      });
    }

    payment.status = data.status === "failed" ? "failed" : "abandoned";
    await payment.save();

    return NextResponse.json({
      success: false,
      status: payment.status,
      message: `Payment ${payment.status}`,
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 },
    );
  }
}
