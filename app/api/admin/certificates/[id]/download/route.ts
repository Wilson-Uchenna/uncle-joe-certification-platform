import { NextRequest, NextResponse } from "next/server";
import { withAdmin, RouteContext } from "@/lib/api-utils";
import { Result } from "@/models/ExamResults";
import { Exam } from "@/models/Exam";
import mongoose from "mongoose";
import { generateCertificatePDF } from "@/lib/pdfGenerator";

export const GET = withAdmin(async (req: NextRequest, adminUser, context: RouteContext) => {
  const { certId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(certId)) {
    return NextResponse.json({ success: false, error: "Invalid certificate ID" }, { status: 400 });
  }

  const result = await Result.findById(certId).lean();

  if (!result) {
    return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
  }

  if (result.certificateStatus !== "approved") {
    return NextResponse.json(
      { success: false, error: "Certificate must be approved before download" },
      { status: 403 }
    );
  }

  // Get exam data for correctCount/totalQuestions if not in result
  let correctCount = result.correctCount;
  let totalQuestions = result.totalQuestions;

  if (!correctCount || !totalQuestions) {
    const exam = await Exam.findById(result.examId).lean();
    if (exam) {
      correctCount = exam.correctCount;
      totalQuestions = exam.totalQuestions;
    }
  }

  // Generate PDF
  const pdfBuffer = await generateCertificatePDF({
    userName: result.userName,
    categoryName: result.categoryName,
    skillLevel: result.skillLevel,
    score: result.score,
    correctCount: correctCount || 0,
    totalQuestions: totalQuestions || 0,
    passed: result.passed,
    issuedAt: (result.certificateApprovedAt || result.createdAt).toISOString(),
    verificationCode: result._id.toString(),
  });

  // Mark as downloaded
  await Result.findByIdAndUpdate(certId, {
    $set: { certificateDownloaded: true },
  });

  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${result.userName.replace(/\s+/g, "-").toLowerCase()}-${result._id}.pdf"`,
    },
  });
});