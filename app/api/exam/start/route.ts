import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";
import { Question } from "@/models/Questions";
import { Exam } from "@/models/Exam";
import { ExamAttempt } from "@/models/ExamAttempts"; // NEW
import { headers } from "next/headers";

const TOTAL_QUESTIONS = 100;

type SkillLevel = "entry" | "mid" | "advanced";

const SKILL_LEVEL_TIME_LIMITS: Record<SkillLevel, number> = {
  entry: 45,
  mid: 30,
  advanced: 25,
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

    const body = (await req.json()) as {
      categoryId: string;
      skillLevel: SkillLevel;
      isFinalStage?: boolean;
    };
    const { categoryId, skillLevel, isFinalStage = false } = body;

    if (!categoryId || !skillLevel) {
      return NextResponse.json(
        { success: false, error: "categoryId and skillLevel are required" },
        { status: 400 },
      );
    }

    if (!["entry", "mid", "advanced"].includes(skillLevel)) {
      return NextResponse.json(
        { success: false, error: "Invalid skillLevel. Must be entry, mid, or advanced." },
        { status: 400 },
      );
    }

    // ─── Abandon any stale in-progress exam ───
    await Exam.updateMany(
      { userId: session.user.id, status: "in_progress" },
      {
        $set: {
          status: "abandoned",
          passed: false,
          completedAt: new Date(),
          abandonReason: "user_started_new_exam",
        },
      },
    );

    // ─── Abandon any stale in-progress attempt (mirrors the Exam cleanup above) ───
    await ExamAttempt.updateMany(
      { userId: session.user.id, status: "in_progress" },
      { $set: { status: "terminated", endReason: "abandoned", endedAt: new Date() } },
    );

    // Rate limit — now attempt-based instead of Exam-based
    const recentAttempts = await ExamAttempt.countDocuments({
      userId: session.user.id,
      startedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { success: false, error: "Too many exams started recently. Please wait." },
        { status: 429 },
      );
    }

    // ─── Get category ───
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // ─── Final stage check ───
    if (isFinalStage) {
      const passedExam = await Exam.findOne({
        userId: session.user.id,
        categoryId,
        passed: true,
        certificateDownloaded: true,
      });
      if (!passedExam) {
        return NextResponse.json(
          { success: false, error: "Not qualified for final stage" },
          { status: 403 },
        );
      }
    }

    // ─── Fetch questions ───
    const questions = await Question.aggregate([
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          skillLevel,
          isFinalStage,
          isActive: true,
        },
      },
      { $sample: { size: TOTAL_QUESTIONS } },
    ]);

    if (questions.length < TOTAL_QUESTIONS) {
      return NextResponse.json(
        {
          success: false,
          error: `Not enough questions available for "${category.name}" at ${skillLevel} level. Found ${questions.length}, need ${TOTAL_QUESTIONS}.`,
        },
        { status: 400 },
      );
    }

    const timeLimit = SKILL_LEVEL_TIME_LIMITS[skillLevel];

    // ─── Create exam ───
    const exam = await Exam.create({
      userId: session.user.id,
      userName: session.user.name,
      categoryId,
      categoryName: category.name,
      skillLevel,
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      totalQuestions: TOTAL_QUESTIONS,
      timeLimit,
      isFinalStage,
      status: "in_progress",
      startedAt: new Date(),
    });

    // ─── Open the attempt, linked to this exam ───
    await ExamAttempt.create({
      userId: session.user.id,
      categoryId,
      skillLevel,
      examId: exam._id,
      status: "in_progress",
      startedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      examId: exam._id,
      questions: questions.map((q) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        codeSnippet: q.codeSnippet,
        language: q.language,
        selectedAnswer: q.selectedAnswer,
      })),
      timeLimit,
      totalQuestions: TOTAL_QUESTIONS,
      skillLevel,
    });
  } catch (error) {
    console.error("Exam start error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start exam" },
      { status: 500 },
    );
  }
}