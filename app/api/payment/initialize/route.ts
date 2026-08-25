import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { Payment } from "@/models/payment";
import { paystack } from "@/lib/paystack";

const PRICES: Record<string, number> = {
  results: 5000,
};

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
    const { examId, type = "results" } = await req.json();

    const amount = PRICES[type];
    if (!examId || !amount) {
      return NextResponse.json(
        { success: false, error: "Invalid data" },
        { status: 400 },
      );
    }

    const exam = await Exam.findOne({
      _id: examId,
      userId: session.user.id,
    }).lean();

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 },
      );
    }

    const existingSuccess = await Payment.findOne({
      userId: session.user.id,
      examId,
      type,
      status: "success",
    });

    if (existingSuccess) {
      return NextResponse.json(
        { success: false, error: "Already paid for this exam" },
        { status: 409 },
      );
    }

    // NEW — reuse a still-fresh pending payment instead of creating another one
    const existingPending = await Payment.findOne({
      userId: session.user.id,
      examId,
      type,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (existingPending) {
      return NextResponse.json({
        success: true,
        reference: existingPending.providerReference,
        email: session.user.email,
        amount: existingPending.amount,
      });
    }

    const reference = `RES-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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