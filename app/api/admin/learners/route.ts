import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { db} from '@/lib/db'
import mongoose from "mongoose";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search")?.trim() || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  // Better Auth stores users in "user" collection
  const usersCollection = db.collection("user");

  const matchStage: any = {};
  if (filter !== "all") matchStage.status = filter;
  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    usersCollection
      .find(matchStage)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        name: 1,
        email: 1,
        image: 1,
        role: 1,
        skillLevel: 1,
        state: 1,
        country: 1,
        status: 1,
        updatedAt: 1,
        createdAt: 1,
      })
      .toArray(),

    usersCollection.countDocuments(matchStage),
  ]);

  const userIds = users.map((u: any) => u._id.toString());

  const [examStats, certStats] = await Promise.all([
    Exam.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", examsTaken: { $sum: 1 } } },
    ]),
    Result.aggregate([
      {
        $match: {
          userId: { $in: userIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
          certificateAvailable: true,
        },
      },
      { $group: { _id: "$userId", certsEarned: { $sum: 1 } } },
    ]),
  ]);

  const examMap = new Map(examStats.map((e: any) => [e._id, e.examsTaken]));
  const certMap = new Map(certStats.map((c: any) => [c._id.toString(), c.certsEarned]));

  const learners = users.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    skillLevel: u.skillLevel || "Beginner",
    state: u.state || "—",
    country: u.country || "—",
    examsTaken: examMap.get(u._id.toString()) || 0,
    certificatesEarned: certMap.get(u._id.toString()) || 0,
    lastActive: u.updatedAt?.toISOString() || u.createdAt?.toISOString(),
    status: u.status || "active",
  }));

  return NextResponse.json({
    success: true,
    learners,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});