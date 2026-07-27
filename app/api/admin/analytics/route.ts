// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Exam } from "@/models/Exam";
import { Payment } from "@/models/payment";

export const GET = withAdmin(async (req: NextRequest, user: any) => {
  const [
    totalExamsTaken,
    completedExams,
    paidCertificates,
    totalRevenue
  ] = await Promise.all([
    Exam.countDocuments(),
    Exam.countDocuments({ status: "completed" }),
    Exam.countDocuments({ certificateDownloaded: true }),
    Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  return NextResponse.json({
    success: true,
    analytics: {
      totalExamsTaken,
      examCompletionRate: totalExamsTaken > 0
        ? Math.round((completedExams / totalExamsTaken) * 100)
        : 0,
      certificateDownloadRate: completedExams > 0
        ? Math.round((paidCertificates / completedExams) * 100)
        : 0,
      revenueGenerated: revenue,
      conversionFunnel: {
        startedExam: totalExamsTaken,
        completedExam: completedExams,
        paidForCertificate: paidCertificates
      }
    }
  });
});