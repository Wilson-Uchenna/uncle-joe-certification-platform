// app/api/exams/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Result } from "@/models/ExamResults";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const passedOnly = searchParams.get("passed") === "true";

    const query: any = { userId: new mongoose.Types.ObjectId(session.user.id) };
    if (passedOnly) query.passed = true;

    const results = await Result.find(query)
      .sort({ createdAt: -1 })
      .select("examId categoryName skillLevel score passed certificateAvailable certificateDownloaded createdAt")
      .lean();

    // Get exam payment data
    const examIds = results.map((r: any) => r.examId).filter(Boolean);
    const exams = await mongoose.connection
      .collection("exams")
      .find({ _id: { $in: examIds } })
      .project({ certificatePaidAt: 1 })
      .toArray();

    const examMap = new Map(exams.map((e: any) => [e._id.toString(), e]));

    const enriched = results.map((r: any) => ({
      _id: r._id.toString(),
      examId: r.examId?.toString(),
      categoryName: r.categoryName,
      skillLevel: r.skillLevel,
      score: r.score,
      passed: r.passed,
      certificateAvailable: r.certificateAvailable,
      certificateDownloaded: r.certificateDownloaded,
      certificatePaidAt: examMap.get(r.examId?.toString())?.certificatePaidAt,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, results: enriched });
  } catch (error: any) {
    console.error("GET /api/exams/results error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch results" },
      { status: 500 }
    );
  }
}