import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // ← Added headers
    });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { examId, questionIndex, answerIndex, timeSpent } = await req.json();

    const exam = await Exam.findOne({
      _id: examId,
      userId: session.user.id,
      status: "in_progress",
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or not in progress" },
        { status: 404 },
      );
    }

    // Update answer
    if (questionIndex < 0 || questionIndex >= exam.questions.length) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }
    if (exam.status !== "in_progress") {
      return NextResponse.json({ error: "Exam ended" }, { status: 400 });
    }
    if (
      answerIndex < -1 ||
      answerIndex >= exam.questions[questionIndex].options.length
    ) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }

    await exam.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exam save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save answer" },
      { status: 500 },
    );
  }
}
