import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Exam } from "@/models/Exam";
import { Question } from "@/models/Questions";
import mongoose from "mongoose";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const days = parseInt(searchParams.get("days") || "30");

    const matchStage: any = {};
    if (categoryId) {
      matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (days > 0) {
      matchStage.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }

    const [
      totalExams,
      completedExams,
      passRateAgg,
      avgScoreAgg,
      avgTimeAgg,
      participationByDay,
      topPerformers,
      questionStats,
      roleBreakdown, // ← ADD THIS
    ] = await Promise.all([
      Exam.countDocuments(matchStage),
      Exam.countDocuments({ ...matchStage, status: "completed" }),
      Exam.aggregate([
        { $match: { ...matchStage, status: "completed" } },
        {
          $group: {
            _id: null,
            passed: { $sum: { $cond: ["$passed", 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      Exam.aggregate([
        { $match: { ...matchStage, status: "completed" } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]),
      Exam.aggregate([
        { $match: { ...matchStage, status: "completed" } },
        { $group: { _id: null, avgTime: { $avg: "$timeUsed" } } },
      ]),
      Exam.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Exam.aggregate([
        { $match: { ...matchStage, status: "completed" } },
        { $sort: { score: -1, timeUsed: 1 } },
        { $limit: 10 },
        {
          $project: {
            userId: 1,
            userName: 1,
            score: 1,
            timeUsed: 1,
            categoryName: 1,
            passed: 1,
          },
        },
      ]),
      Question.aggregate([
        { $match: categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {} },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            finalStage: { $sum: { $cond: ["$isFinalStage", 1, 0] } },
            avgDifficulty: { $avg: "$difficulty" },
          },
        },
      ]),
      // ← ADD THIS BLOCK
      Question.aggregate([
        { $match: categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {} },
        {
          $group: {
            _id: { $ifNull: ["$role", "Unassigned"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const completed = completedExams || 0;
    const passed = passRateAgg[0]?.passed || 0;
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;
    const avgScore = Math.round(avgScoreAgg[0]?.avgScore || 0);
    const avgTime = Math.round((avgTimeAgg[0]?.avgTime || 0) / 60);

    return NextResponse.json({
      success: true,
      report: {
        overview: {
          totalExams,
          completedExams: completed,
          passRate,
          avgScore,
          avgTimeMinutes: avgTime,
        },
        participation: participationByDay,
        topPerformers: topPerformers.map((p: any) => ({
          userId: p.userId,
          userName: p.userName || "Anonymous",
          score: Math.round(p.score),
          timeUsed: Math.round(p.timeUsed / 60),
          category: p.categoryName,
          passed: p.passed,
        })),
        questionBank: questionStats[0] || {
          total: 0,
          active: 0,
          finalStage: 0,
          avgDifficulty: 0,
        },
        // ← ADD THIS TO RESPONSE
        roleBreakdown: roleBreakdown.map((r: any) => ({
          role: r._id,
          count: r.count,
        })),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to complete this action. Please try again." },
      { status: 500 }
    );
  }
});