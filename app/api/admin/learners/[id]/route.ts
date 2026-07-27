import { NextRequest, NextResponse } from "next/server";
import { withAdmin, RouteContext } from "@/lib/api-utils";
import mongoose from "mongoose";
import { db } from "@/lib/db";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";

export const GET = withAdmin(async (req: NextRequest, user, context: RouteContext) => {
  const { userId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
  }

  const usersCollection = db.collection("user");

  const [learner, exams, results, totalExams, totalCerts] = await Promise.all([
    usersCollection.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        projection: {
          password: 0,
          emailVerificationToken: 0,
          resetToken: 0,
          resetTokenExpiresAt: 0,
        },
      }
    ),

    Exam.find({ userId })
      .sort({ startedAt: -1 })
      .limit(10)
      .select("categoryName skillLevel score status passed startedAt completedAt timeUsed")
      .lean(),

    Result.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("examId categoryName score passed certificateAvailable createdAt")
      .lean(),

    Exam.countDocuments({ userId }),
    Result.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      certificateAvailable: true,
    }),
  ]);

  if (!learner) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    learner: {
      id: learner._id.toString(),
      name: learner.name,
      email: learner.email,
      image: learner.image,
      role: learner.role,
      skillLevel: learner.skillLevel || "Beginner",
      state: learner.state || "—",
      country: learner.country || "—",
      status: learner.status || "active",
      createdAt: learner.createdAt,
      lastActive: learner.updatedAt || learner.createdAt,
      totalExams,
      totalCertificates: totalCerts,
      recentExams: exams.map((e: any) => ({
        id: e._id.toString(),
        category: e.categoryName,
        level: e.skillLevel,
        score: e.score,
        status: e.status,
        passed: e.passed,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        timeUsed: e.timeUsed,
      })),
      certificates: results
        .filter((r: any) => r.certificateAvailable)
        .map((r: any) => ({
          id: r._id.toString(),
          examId: r.examId?.toString(),
          category: r.categoryName,
          score: r.score,
          earnedAt: r.createdAt,
        })),
    },
  });
});