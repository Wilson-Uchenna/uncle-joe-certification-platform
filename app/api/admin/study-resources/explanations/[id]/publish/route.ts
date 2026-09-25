// app/api/admin/study-resources/explanations/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import ExplanationResource from "@/models/ExplanationResources";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { id } = await params;
  const { isPublished } = await req.json();

  const resource = await ExplanationResource.findByIdAndUpdate(
    id,
    { isPublished: !!isPublished },
    { returnDocument: "after" },
  ).select("isPublished");

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ isPublished: resource.isPublished });
}
