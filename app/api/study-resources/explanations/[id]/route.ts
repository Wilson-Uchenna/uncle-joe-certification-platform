// app/api/study-resources/explanations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasStudyResourcesAccess } from "@/lib/studyResources";
import ExplanationResource from "@/models/ExplanationResources";
import connectDB from "@/lib/local-db";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const hasAccess = await hasStudyResourcesAccess(session.user.id, "pdf_materials");
  if (!hasAccess) {
    return NextResponse.json({ error: "Access required" }, { status: 403 });
  }

  const { id } = await params;

  const resource = await ExplanationResource.findById(id).lean();
  if (!resource || !resource.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signedUrl = cloudinary.utils.private_download_url(resource.publicId, "pdf", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 5,
  });

  return NextResponse.json({ url: signedUrl });
}