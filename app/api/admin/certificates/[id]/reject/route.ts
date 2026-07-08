import { NextRequest, NextResponse } from "next/server";
import { withAdmin, RouteContext } from "@/lib/api-utils";
import { Result } from "@/models/ExamResults";
import mongoose from "mongoose";

export const POST = withAdmin(async (req: NextRequest, adminUser, context: RouteContext) => {
  const { certId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(certId)) {
    return NextResponse.json({ success: false, error: "Invalid certificate ID" }, { status: 400 });
  }

  const result = await Result.findByIdAndUpdate(
    certId,
    {
      $set: {
        certificateStatus: "rejected",
        certificateRejectedAt: new Date(),
        certificateRejectedBy: adminUser.id,
      },
    },
    { new: true }
  );

  if (!result) {
    return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Certificate rejected",
    certificate: {
      id: result._id.toString(),
      status: result.certificateStatus,
    },
  });
});