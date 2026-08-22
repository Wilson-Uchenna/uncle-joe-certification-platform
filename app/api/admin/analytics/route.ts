import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import connectDB from "@/lib/local-db";
import mongoose from "mongoose";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";
import { Payment } from "@/models/payment";

export const GET = withAdmin(async (req: NextRequest, user: any) => {
  await connectDB();

  const [
    totalRegistrations,
    totalExamsTaken,
    completedExams,
    paidForResults,
    certificatesIssued,
    totalRevenue,
  ] = await Promise.all([
    mongoose.connection.collection("user").countDocuments(),
    Exam.countDocuments(),
    Exam.countDocuments({ status: "completed" }),
    Result.countDocuments({ resultsPaidAt: { $ne: null } }),
    Result.countDocuments({ resultsPaidAt: { $ne: null }, passed: true }),
    Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  return NextResponse.json({
    success: true,
    analytics: {
      totalRegistrations,
      totalExamsTaken,
      examCompletionRate:
        totalExamsTaken > 0 ? Math.round((completedExams / totalExamsTaken) * 100) : 0,
      certificateDownloadRate:
        paidForResults > 0 ? Math.round((certificatesIssued / paidForResults) * 100) : 0,
      revenueGenerated: revenue,
      conversionFunnel: {
        registered: totalRegistrations,
        startedExam: totalExamsTaken,
        completedExam: completedExams,
        paidForResults,
        certificatesIssued,
      },
    },
  });
});