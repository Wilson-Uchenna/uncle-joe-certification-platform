import { NextRequest, NextResponse } from "next/server";
import { withAdmin, RouteContext } from "@/lib/api-utils";
import { Result } from "@/models/ExamResults";
import { Exam } from "@/models/Exam";
import mongoose from "mongoose";
import { generateCertificatePDF } from "@/lib/pdfGenerator";
import fs from "fs";
import path from "path";

function loadSealAsDataUri(): string {
  const sealPath = path.join(process.cwd(), "public", "official_seal_v10.png");
  const fileBuffer = fs.readFileSync(sealPath);
  const base64 = fileBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

export const GET = withAdmin(async (req: NextRequest, adminUser, context: RouteContext) => {
  const { id: certId } = await context.params;

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
  const sealImageSrc = loadSealAsDataUri();

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
  sealImageSrc,
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