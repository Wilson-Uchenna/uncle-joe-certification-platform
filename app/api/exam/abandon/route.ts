import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { ExamAttempt } from "@/models/ExamAttempts"; // NEW
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();
    const { examId } = await req.json();

    const exam = await Exam.findOneAndUpdate(
      {
        _id: examId,
        userId: session.user.id,
        status: "in_progress",
      },
      {
        $set: {
          status: "abandoned",
          passed: false,
          completedAt: new Date(),
          abandonReason: "page_closed",
        },
      },
    );

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or already finished" },
        { status: 404 },
      );
    }

    await ExamAttempt.updateOne(
      {
        userId: session.user.id,
        categoryId: exam.categoryId,
        skillLevel: exam.skillLevel,
        "attempts.examId": examId,
      },
      {
        $set: {
          "attempts.$[entry].status": "terminated",
          "attempts.$[entry].endReason": "abandoned",
          "attempts.$[entry].endedAt": new Date(),
        },
      },
      { arrayFilters: [{ "entry.examId": examId }] },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Abandon exam error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to abandon exam" },
      { status: 500 },
    );
  }
}
