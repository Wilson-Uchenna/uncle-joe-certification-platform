// /api/exam/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
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

    const { examId, questionIndex, answerIndex, timeSpent } = await req.json();

    if (!examId || questionIndex === undefined || answerIndex === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Use $set with positional notation — this actually writes to DB
    const result = await Exam.updateOne(
      {
        _id: examId,
        userId: session.user.id,
        status: "in_progress",
      },
      {
        $set: {
          [`questions.${questionIndex}.selectedAnswer`]: answerIndex,
          ...(timeSpent !== undefined && {
            [`questions.${questionIndex}.timeSpent`]: timeSpent,
          }),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Exam not found or already submitted" },
        { status: 404 },
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Answer not saved — no changes made" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved",
    });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save answer" },
      { status: 500 },
    );
  }
}