import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";
import { Question } from "@/models/Questions";
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

    const body = await req.json();
    const { categoryId, selectedRole, isFinalStage = false } = body;

    // Validate
    if (!categoryId || !selectedRole) {
      return NextResponse.json(
        { success: false, error: "categoryId and selectedRole required" },
        { status: 400 },
      );
    }

    // Check for ongoing exam
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

    // Get category
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // Validate role exists in category
    if (!category.roles.includes(selectedRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid role for this category" },
        { status: 400 },
      );
    }

    // For final stage, check qualification
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

    // Get random questions
    const questionCount = 20;
    const timeLimit = isFinalStage ? 8 : category.examTimeLimit;

    const questions = await Question.aggregate([
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          isFinalStage,
          isActive: true,
        },
      },
      { $sample: { size: questionCount } },
    ]);

    if (questions.length < questionCount) {
      return NextResponse.json(
        { success: false, error: "Not enough questions available" },
        { status: 400 },
      );
    }

    // Create exam
    const exam = await Exam.create({
      userId: session.user.id,
      userName: session.user.name,
      categoryId,
      categoryName: category.name,
      skillLevel: category.skillLevel,
      selectedRole,
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        options: q.options,
      })),
      totalQuestions: questionCount,
      timeLimit,
      isFinalStage,
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
      })),
      timeLimit,
      totalQuestions: questionCount,
    });
  } catch (error) {
    console.error("Exam start error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start exam" },
      { status: 500 },
    );
  }
}
