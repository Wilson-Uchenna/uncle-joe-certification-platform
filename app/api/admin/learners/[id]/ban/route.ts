import { NextRequest, NextResponse } from "next/server";
import { withAdmin, RouteContext } from "@/lib/api-utils";
import mongoose from "mongoose";

export const POST = withAdmin(async (req: NextRequest, adminUser, context: RouteContext) => {
  const { userId } = await context.params;
  const body = await req.json().catch(() => ({}));
  const action = body.action || "ban";
  const reason = body.reason || "Admin action";

  const statusMap: Record<string, string> = {
    ban: "banned",
    unban: "active",
    suspend: "suspended",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }

  const usersCollection = mongoose.connection.collection("user");

  const update: any = {
    $set: {
      status: newStatus,
      updatedAt: new Date(),
    },
  };

  if (action === "ban") {
    update.$set.bannedAt = new Date();
    update.$set.bannedBy = adminUser.id;
    update.$set.banReason = reason;
  } else if (action === "unban") {
    update.$unset = {
      bannedAt: "",
      bannedBy: "",
      banReason: "",
      suspendedAt: "",
      suspendedBy: "",
      suspendReason: "",
    };
  } else if (action === "suspend") {
    update.$set.suspendedAt = new Date();
    update.$set.suspendedBy = adminUser.id;
    update.$set.suspendReason = reason;
  }

  const result = await usersCollection.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(userId) },
    update,
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: `User ${action === "ban" ? "banned" : action === "unban" ? "restored" : "suspended"} successfully`,
    user: { id: result._id.toString(), status: result.status },
  });
});