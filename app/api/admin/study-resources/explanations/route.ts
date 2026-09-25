// app/api/admin/study-resources/explanations/route.ts
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const categoryName = formData.get("categoryName") as string;
    const skillLevel = formData.get("skillLevel") as string;

    if (!file || !title || !categoryId || !categoryName || !skillLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Uploaded as "authenticated" so it can never be fetched via a public URL —
    // only the signed-download route can open it, which is what enforces the paywall.
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            type: "authenticated",
            folder: "study-resources/explanations",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const resource = await ExplanationResource.create({
      title,
      description,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileSize: uploadResult.bytes,
      categoryId,
      categoryName,
      skillLevel,
      createdBy: session.user.id,
      isPublished: false, // stays draft until you explicitly publish it
    });

    return NextResponse.json({ id: resource._id }, { status: 201 });
  } catch (error: any) {
    console.error("Explanation upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}