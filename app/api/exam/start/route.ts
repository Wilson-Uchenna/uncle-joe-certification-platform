import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";
import { Question } from "@/models/Questions";
import { Exam } from "@/models/Exam";
import { headers } from "next/headers";

const TOTAL_QUESTIONS = 20;

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

    const body = await req.json();
    const { categoryId, selectedRole, isFinalStage = false } = body;

    // ─── Validation ───
    if (!categoryId || !selectedRole) {
      return NextResponse.json(
        { success: false, error: "categoryId and selectedRole are required" },
        { status: 400 },
      );
    }

    // ─── Check ongoing exam ───
    const existingExam = await Exam.findOne({
      userId: session.user.id,
      status: "in_progress",
    });

    if (existingExam) {
      return NextResponse.json(
        {
          success: false,
          error: "You have an ongoing exam",
          examId: existingExam._id,
        },
        { status: 400 },
      );
    }

    // In start exam, after ongoing check:
    const recentExams = await Exam.countDocuments({
      userId: session.user.id,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    });

    if (recentExams >= 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many exams started recently. Please wait.",
        },
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

    // ─── Validate role exists in category ───
    if (!category.roles.includes(selectedRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid role for this category" },
        { status: 400 },
      );
    }

    // ─── Final stage qualification check ───
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

    // ─── 🔥 FIX: Filter by selectedRole ───
    const timeLimit = isFinalStage ? 8 : category.examTimeLimit;

    const questions = await Question.aggregate([
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          role: selectedRole, // ← ONLY questions for this sub-role
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
          error: `Not enough questions available for "${selectedRole}". Found ${questions.length}, need ${TOTAL_QUESTIONS}.`,
        },
        { status: 400 },
      );
    }

    // ─── Create exam ───
    const exam = await Exam.create({
      userId: session.user.id,
      userName: session.user.name,
      categoryId,
      categoryName: category.name,
      skillLevel: category.skillLevel,
      selectedRole, // ← Store the role on the exam
      passThreshold: category.passThreshold || 60, // ← ADD
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

    // ─── Return (no correct answers!) ───
    return NextResponse.json({
      success: true,
      examId: exam._id,
      questions: questions.map((q) => ({
        id: q._id,
        question: q.question,
        options: q.options,
      })),
      timeLimit,
      totalQuestions: TOTAL_QUESTIONS,
      selectedRole,
    });
  } catch (error) {
    console.error("Exam start error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start exam" },
      { status: 500 },
    );
  }
}
