import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { Payment } from "@/models/payment";
import { paystack } from "@/lib/paystack";

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
    const { examId, amount = 5000, type = "certificate" } = await req.json();

    if (!examId || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid data" },
        { status: 400 },
      );
    }

    const exam = await Exam.findOne({
      _id: examId,
      userId: session.user.id,
      passed: true,
    }).lean();

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or not passed" },
        { status: 404 },
      );
    }

    const existing = await Payment.findOne({
      userId: session.user.id,
      examId,
      type: "certificate",
      status: "success",
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already paid for this certificate" },
        { status: 409 },
      );
    }

    const reference = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await Payment.create({
      userId: session.user.id,
      examId,
      type,
      amount,
      currency: "NGN",
      provider: "paystack",
      providerReference: reference,
      status: "pending",
      metadata: {
        userName: session.user.name,
        userEmail: session.user.email,
        examCategory: exam.categoryName,
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      email: session.user.email,
      amount,
    });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize" },
      { status: 500 },
    );
  }
}
