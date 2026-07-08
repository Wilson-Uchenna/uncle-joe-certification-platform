import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Result } from "@/models/ExamResults";

export const GET = withAdmin(async () => {
  const stats = await Result.aggregate([
    { $match: { certificateAvailable: true } },
    {
      $group: {
        _id: "$certificateStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Result.countDocuments({ certificateAvailable: true });

  const pending = stats.find((s: any) => s._id === "pending")?.count || 0;
  const approved = stats.find((s: any) => s._id === "approved")?.count || 0;
  const rejected = stats.find((s: any) => s._id === "rejected")?.count || 0;
  const unset = total - pending - approved - rejected; // Legacy records without status

  return NextResponse.json({
    success: true,
    stats: {
      total,
      pending: pending + unset, // Treat unset as pending
      approved,
      rejected,
    },
  });
});
