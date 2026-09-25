import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";

const PRICES: Record<string, number> = {
  registration: 10000,
  pdf_materials: 2000,
  past_questions: 1000,
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

    const body = await req.json();
    const type = body?.type;

    if (!type || !(type in PRICES)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment type" },
        { status: 400 },
      );
    }

    await connectDB();
    const amount = PRICES[type];

    const existingSuccess = await Payment.findOne({
      userId: session.user.id,
      type,
      status: "success",
    });

    if (existingSuccess) {
      return NextResponse.json(
        { success: false, error: "Already paid" },
        { status: 409 },
      );
    }

    const existingPending = await Payment.findOne({
      userId: session.user.id,
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

    const prefix = type === "pdf_materials" ? "PDF" : type === "past_questions" ? "PQ" : "REG";
    const reference = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await Payment.create({
      userId: session.user.id,
      type,
      amount,
      currency: "NGN",
      provider: "flutterwave",
      providerReference: reference,
      status: "pending",
      metadata: {
        userName: session.user.name,
        userEmail: session.user.email,
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