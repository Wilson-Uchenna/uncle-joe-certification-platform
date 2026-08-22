import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";
import { Ranking } from "@/models/rankings";
import { headers } from "next/headers";
import mongoose from "mongoose";
import ExamAttempt from "@/models/ExamAttempts";
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

  const { examId, isTimeout = false, cheatingDetected = false } = await req.json();

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
    exam.status = cheatingDetected ? "cheating_detected" : isTimeout ? "timed_out" : "completed";
    exam.completedAt = new Date();
    exam.timeUsed = exam.questions.reduce(
      (sum: any, q: { timeSpent: any }) => sum + (q.timeSpent || 0),
      0,
    );
    exam.qualifiesForFinals = passed && !exam.isFinalStage;

    await exam.save();

    // NEW — close out the attempt tied to this exam
    await ExamAttempt.updateOne(
  { userId: session.user.id, categoryId: exam.categoryId, skillLevel: exam.skillLevel, "attempts.examId": exam._id },
  {
    $set: {
      "attempts.$[entry].status": cheatingDetected ? "terminated" : "completed",
      "attempts.$[entry].endReason": cheatingDetected
        ? "cheating_detected"
        : isTimeout
          ? "timed_out"
          : "submitted",
      "attempts.$[entry].endedAt": new Date(),
    },
  },
  { arrayFilters: [{ "entry.examId": exam._id }] },
);

    const EMBARGO_HOURS = Number(process.env.RESULTS_EMBARGO_HOURS) || 5;

    // Create result
    const result = await Result.create({
      examId: exam._id,
      userId: session.user.id,
      userName: session.user.name,
      categoryName: exam.categoryName,
      skillLevel: exam.skillLevel,
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
  try {
    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate all exam results for this user
    const userStats = await Result.aggregate([
      { $match: { userId: userObjectId, passed: true } },
      {
        $group: {
          _id: null,
          totalScore: { $sum: "$score" },
          examCount: { $sum: 1 },
          certificates: { $sum: { $cond: ["$certificateAvailable", 1, 0] } },
          categories: {
            $addToSet: {
              categoryName: "$categoryName",
              score: "$score",
            },
          },
        },
      },
    ]);

    if (!userStats.length) return;

    const stats = userStats[0];
    const avgScore = Math.round(stats.totalScore / stats.examCount);

    // Get user profile for state/country
    const userProfile = await mongoose.connection
      .collection("user")
      .findOne({ _id: userObjectId });

    const state = userProfile?.state || "Unknown";
    const country = userProfile?.country || "Unknown";
    const skillLevel = userProfile?.skillLevel || "entry";

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Define all ranking types to update for this user
    const rankingConfigs = [
      { type: "overall" as const, query: { rankingType: "overall" } },
      { type: "state" as const, query: { rankingType: "state", state } },
      {
        type: "monthly" as const,
        query: { rankingType: "monthly", period: currentPeriod },
      },
    ];

    const categoryResults = await Result.aggregate([
      { $match: { userId: userObjectId, passed: true } },
      {
        $group: {
          _id: "$categoryName",
          totalScore: { $sum: "$score" },
          examCount: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    // Update all rankings in a session for consistency
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Update overall, state, and monthly rankings
        for (const config of rankingConfigs) {
          await Ranking.findOneAndUpdate(
            { userId: userObjectId, ...config.query },
            {
              $set: {
                userName,
                state,
                country,
                skillLevel,
                score: stats.totalScore,
                examsTaken: stats.examCount,
                certificatesEarned: stats.certificates,
                averageScore: avgScore,
                isActive: true,
                updatedAt: now,
              },
              $setOnInsert: {
                createdAt: now,
                rank: 999999, // Will be recalculated
              },
            },
            { upsert: true, session },
          );
        }

        for (const cat of categoryResults) {
          await Ranking.findOneAndUpdate(
            {
              userId: userObjectId,
              rankingType: "category",
              categoryName: cat._id,
            },
            {
              $set: {
                userName,
                state,
                country,
                skillLevel,
                score: cat.totalScore,
                examsTaken: cat.examCount,
                averageScore: Math.round(cat.avgScore),
                isActive: true,
                updatedAt: now,
              },
              $setOnInsert: {
                createdAt: now,
                rank: 999999,
              },
            },
            { upsert: true, session },
          );
        }
      });

      // 3. Recalculate ranks for all affected leaderboards
      await recalculateRanks(session, [
        { rankingType: "overall" },
        { rankingType: "state", state },
        { rankingType: "monthly", period: currentPeriod },
        ...categoryResults.map((c) => ({
          rankingType: "category" as const,
          categoryName: c._id,
        })),
      ]);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Update rankings error:", error);
    throw error;
  }
}

// Recalculate ranks for specified leaderboards
async function recalculateRanks(
  session: mongoose.ClientSession,
  filters: Array<Record<string, any>>,
) {
  for (const filter of filters) {
    // Get all rankings for this filter, sorted by score desc, then examsTaken desc
    const rankings = await Ranking.find({ ...filter, isActive: true })
      .sort({ score: -1, examsTaken: -1, averageScore: -1 })
      .session(session)
      .lean();

    // Bulk update ranks
    const bulkOps = rankings.map((ranking, index) => ({
      updateOne: {
        filter: { _id: ranking._id },
        update: {
          $set: {
            previousRank: ranking.rank || index + 1,
            rank: index + 1,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await Ranking.bulkWrite(bulkOps, { session });
    }
  }
}
