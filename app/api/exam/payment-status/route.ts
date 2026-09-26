// app/api/exam/payment-status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const unclaimedPayment = await Payment.findOne({
    userId: session.user.id,
    type: "exam",
    status: "success",
    examId: { $exists: false }, // paid, but not yet used to actually create an exam
  }).lean();

  return NextResponse.json({ hasPaid: !!unclaimedPayment });
}
