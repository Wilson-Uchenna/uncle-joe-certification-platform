import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import mongoose from "mongoose";
import { Result } from "@/models/ExamResults";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";

  const matchStage: any = {
    certificateAvailable: true, // Only show results where cert is available
  };

  if (status !== "all") {
    matchStage.certificateStatus = status;
  }

  // If no certificateStatus field exists yet, we'll derive from other fields
  // For now, aggregate with user lookup from Better Auth's user collection
  const usersCollection = mongoose.connection.collection("user");

  const certificates = await Result.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        userIdStr: { $toString: "$userId" },
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: { $toString: "$_id" },
        userName: { $ifNull: ["$user.name", "$userName"] },
        email: { $ifNull: ["$user.email", "—"] },
        categoryName: 1,
        score: 1,
        issuedAt: "$createdAt",
        verificationCode: { $toString: "$_id" }, // Use result _id as verification code (or generate one)
        status: { $ifNull: ["$certificateStatus", "pending"] },
      },
    },
    { $sort: { issuedAt: -1 } },
  ]);

  return NextResponse.json({
    success: true,
    certificates,
  });
});