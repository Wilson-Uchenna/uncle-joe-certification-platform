// app/api/admin/study-resources/explanations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import ExplanationResource from "@/models/ExplanationResources";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { id } = await params;

  const resource = await ExplanationResource.findById(id);
  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await cloudinary.uploader.destroy(resource.publicId, { resource_type: "raw", type: "authenticated" });
  await resource.deleteOne();

  return NextResponse.json({ success: true });
}