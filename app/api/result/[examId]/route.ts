import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Result } from "@/models/ExamResults";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const { examId } = await params;
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

    const result = await Result.findOne({
      examId,
      userId: session.user.id,
    }).lean();

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Result not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
  success: true,
  result: {
    _id: result._id,
    examId,
    userId: result.userId,
    userName: result.userName,
    categoryName: result.categoryName,
    skillLevel: result.skillLevel,
    selectedRole: result.selectedRole,
    score: result.score,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    passed: result.passed,
    certificateAvailable: result.certificateAvailable,
    certificatePaidAt: result.certificatePaidAt,
    certificateDownloaded: result.certificateDownloaded,
    resultsAvailableAt: result.resultsAvailableAt,
    breakdown: result.breakdown,
    categoryRank: result.categoryRank,
    overallRank: result.overallRank,
    stateRank: result.stateRank,
    shareUrl: result.shareUrl,
  },
});
  } catch (error) {
    console.error("Result GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch result" },
      { status: 500 },
    );
  }
}
