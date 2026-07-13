import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";
import { Ranking } from "@/models/rankings";
import { headers } from "next/headers";
import mongoose from "mongoose";
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

    const { examId, isTimeout = false } = await req.json();

    const exam = await Exam.findOne({
      _id: examId,
      userId: session.user.id,
      status: "in_progress",
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 },
      );
    }

    // Calculate score
    let correctCount = 0;
    for (const q of exam.questions) {
      if (q.selectedAnswer === undefined) {
        q.selectedAnswer = -1; // Mark unanswered
        q.isCorrect = false;
      } else {
        q.isCorrect = q.selectedAnswer === q.correctAnswer;
      }
      if (q.isCorrect) correctCount++;
    }

    const score = Math.round((correctCount / exam.totalQuestions) * 100);
    const passThreshold = exam.passThreshold || 60;
    const passed = score >= passThreshold;

    exam.correctCount = correctCount;
    exam.score = score;
    exam.passed = passed;
    exam.status = isTimeout ? "timed_out" : "completed";
    exam.completedAt = new Date();
    exam.timeUsed = exam.questions.reduce(
      (sum: any, q: { timeSpent: any; }) => sum + (q.timeSpent || 0),
      0,
    );
    // Qualifies for finals?
    exam.qualifiesForFinals = passed && !exam.isFinalStage;

    await exam.save();
    const EMBARGO_HOURS = Number(process.env.RESULTS_EMBARGO_HOURS) || 5;

    // Create result
    const result = await Result.create({
      examId: exam._id,
      userId: session.user.id,
      userName: session.user.name,
      categoryName: exam.categoryName,
      skillLevel: exam.skillLevel,
      selectedRole: exam.selectedRole,
      score,
      correctCount,
      totalQuestions: exam.totalQuestions,
      passed,
      certificateAvailable: passed,
      certificateDownloaded: false,
      resultsAvailableAt: new Date(Date.now() + EMBARGO_HOURS * 60 * 1000), // 24 hours embargo
    });

    // Update rankings (async, don't block)
    updateRankings(session.user.id, session.user.name).catch(console.error);

    return NextResponse.json({
      success: true,
      examId: exam._id,
      score,
      correctCount,
      totalQuestions: exam.totalQuestions,
      passed,
      status: exam.status,
      resultId: result._id,
      certificateAvailable: passed,
      resultsAvailableAt: result.resultsAvailableAt,
    });
  } catch (error) {
    console.error("Exam submit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit exam" },
      { status: 500 },
    );
  }
}

// Background job to update rankings
async function updateRankings(userId: string, userName: string) {
  // Implementation in leaderboard section
}
