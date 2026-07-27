import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Question } from "@/models/Questions";
import mongoose from "mongoose";

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { categoryId, questions } = body;

    if (!categoryId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Required information is missing. Complete all mandatory fields before proceeding." },
        { status: 400 }
      );
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: text is required` },
          { status: 400 }
        );
      }
      if (!q.options || q.options.length < 2 || q.options.some((o: string) => !o?.trim())) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: all options must be filled` },
          { status: 400 }
        );
      }
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: select a correct answer` },
          { status: 400 }
        );
      }
    }

    const docs = questions.map((q) => ({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      question: q.question.trim(),
      options: q.options.map((o: string) => o.trim()),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation?.trim() || "",
      difficulty: Math.min(5, Math.max(1, q.difficulty || 3)),
      isFinalStage: q.isFinalStage || false,
      role: q.role || null, // NEW: sub-role assignment
      isActive: true,
      timesUsed: 0,
      timesCorrect: 0,
    }));

    const result = await Question.insertMany(docs);

    return NextResponse.json({
      success: true,
      message: `Uploaded ${result.length} questions`,
      count: result.length,
    });
  } catch (error) {
    console.error("Question upload error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to complete this action. Please try again." },
      { status: 500 }
    );
  }
});