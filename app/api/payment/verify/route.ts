import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { Exam } from "@/models/Exam";
import { paystack } from "@/lib/paystack";
import { Result } from "@/models/ExamResults";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    if (payment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }


     if (payment.status === "success") {
      const exam = await Exam.findById(payment.examId).lean();
      return NextResponse.json({
        success: true,
        status: "success",
        message: "Already verified",
        examId: payment.examId,
        passed: exam?.passed ?? false,
      });
    }

    const data = await paystack.transaction.verify(reference);

    const expectedKobo = payment.amount * 100;

    if (data.status === "success" && data.amount === expectedKobo) {
      payment.status = "success";
      payment.paidAt = new Date();
      payment.providerTransactionId = data.id?.toString();
      await payment.save();

      const exam = await Exam.findById(payment.examId);
      if (!exam) {
        return NextResponse.json(
          { success: false, error: "Exam not found" },
          { status: 404 },
        );
      }

      // Results always unlock on successful payment
      exam.resultsPaidAt = new Date();

      const resultUpdate: Record<string, any> = {
        resultsPaidAt: new Date(),
      };

      // Certificate only unlocks if they actually passed
      if (exam.passed) {
        exam.certificatePaidAt = new Date();
        resultUpdate.certificateAvailable = true;
        resultUpdate.certificatePaidAt = new Date();
      }
      await exam.save();

      await Result.updateMany(
        { examId: payment.examId, passed: exam.passed },
        resultUpdate,
      );

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment verified",
        examId: payment.examId,
        passed: exam.passed,
      });
    }

    payment.status =
      data.status === "success"
        ? "failed"
        : data.status === "failed"
          ? "failed"
          : "abandoned";
    await payment.save();

    return NextResponse.json({
      success: false,
      status: payment.status,
      message:
        data.status === "success"
          ? "Amount mismatch — payment flagged for review"
          : `Payment ${payment.status}`,
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 },
    );
  }
}
