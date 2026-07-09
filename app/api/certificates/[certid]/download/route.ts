import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Result } from "@/models/ExamResults";
import { Exam } from "@/models/Exam";
import mongoose from "mongoose";
import { generateCertificatePDF } from "@/lib/pdfGenerator";

export async function GET(req: NextRequest, { params }: { params: Promise<{ certId: string }> }) {
  await connectDB();
  const { certId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  console.log("Session:", session);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(certId)) {
    return NextResponse.json({ success: false, error: "Invalid certificate ID" }, { status: 400 });
  }

  const result = await Result.findById(certId).lean();
  if (!result) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  // Security: learners can only download their own certs
  if (result.userId.toString() !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  if (result.certificateStatus !== "approved") {
    return NextResponse.json({ success: false, error: "Not yet approved" }, { status: 403 });
  }

  const pdfBuffer = await generateCertificatePDF({
    userName: result.userName,
    categoryName: result.categoryName,
    skillLevel: result.skillLevel,
    score: result.score,
    correctCount: result.correctCount || 0,
    totalQuestions: result.totalQuestions || 0,
    passed: result.passed,
    issuedAt: (result.certificateApprovedAt || result.createdAt).toISOString(),
    verificationCode: result._id.toString(),
  });

  await Result.findByIdAndUpdate(certId, { $set: { certificateDownloaded: true } });

  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${result._id}.pdf"`,
    },
  });
}