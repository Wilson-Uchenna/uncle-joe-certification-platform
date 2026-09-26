// app/api/payment/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";

// ⚠️ PRICE PLACEHOLDER — confirm the real per-exam price before shipping.
// ₦10,000 was your old ONE-TIME registration fee, not a per-attempt price.
// Charging this every attempt is very likely too high — pick the real number.
const PRICES: Record<string, number> = {
  exam: 10000, // ← CHANGE THIS
  explanation: 2000,
  past_question_review: 1000,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const type = body?.type as string;
    const metadata = body?.metadata ?? {};

    if (!type || !(type in PRICES)) {
      return NextResponse.json({ success: false, error: "Invalid payment type" }, { status: 400 });
    }

    // Each type requires specific metadata identifying exactly what's being paid for
    
    if (type === "explanation" && !metadata.explanationId) {
      return NextResponse.json({ success: false, error: "explanationId is required" }, { status: 400 });
    }
    if (type === "past_question_review" && !metadata.examId) {
      return NextResponse.json({ success: false, error: "examId is required" }, { status: 400 });
    }

    await connectDB();
    const amount = PRICES[type];

    // Dedupe pending payments scoped to the SPECIFIC resource, not just the type —
    // otherwise paying for PDF A would suppress a pending payment for PDF B
    const dedupeFilter: Record<string, any> = {
      userId: session.user.id,
      type: "exam",
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    };
    if (type === "exam") {
      
    }
    if (type === "explanation") {
      dedupeFilter["metadata.explanationId"] = metadata.explanationId;
    }
    if (type === "past_question_review") {
      dedupeFilter["metadata.examId"] = metadata.examId;
    }

    const existingPending = await Payment.findOne(dedupeFilter);
    if (existingPending) {
      return NextResponse.json({
        success: true,
        reference: existingPending.providerReference,
        email: session.user.email,
        amount: existingPending.amount,
      });
    }

    const prefix = type === "exam" ? "EXM" : type === "explanation" ? "PDF" : "PQR";
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
        ...metadata,
      },
    });

    return NextResponse.json({ success: true, reference, email: session.user.email, amount });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to initialize" }, { status: 500 });
  }
}