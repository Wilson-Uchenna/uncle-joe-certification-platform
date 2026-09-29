// app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const categories = await Category.find().select("name").sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}