import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";

// GET: Fetch categories filtered by user's skill level
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const levelFromQuery = req.nextUrl.searchParams.get("level");
    const skillLevel = levelFromQuery || session.user.skillLevel;

    const categories = await Category.find({
      skillLevel,
      isActive: true,
    })
      .select(
        "name slug skillLevel description examTimeLimit passThreshold roles",
      )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      userSkillLevel: session.user.skillLevel,
      categories,
    });
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST: Save onboarding selection
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // ← Added headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { categoryId, selectedRole } = body;

    if (!categoryId || !selectedRole) {
      return NextResponse.json(
        { success: false, error: "categoryId and selectedRole required" },
        { status: 400 },
      );
    }

    // Validate categoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid category ID" },
        { status: 400 },
      );
    }

    await connectDB();

    // Convert string to ObjectId
    const category = await Category.findById(
      new mongoose.Types.ObjectId(categoryId),
    );

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    if (!category.roles.includes(selectedRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid role for this category" },
        { status: 400 },
      );
    }

    // Update user in Better Auth's collection
    const { db } = await import("@/lib/db");
    const usersCollection = db.collection("users");

    const { ObjectId } = await import("mongodb");

    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          onboardingComplete: true,
          selectedCategoryId: categoryId,
          selectedCategoryName: category.name,
          selectedCategorySlug: category.slug,
          selectedRole,
          updatedAt: new Date(),
        },
      },
    );

    // Refresh the session so middleware sees the updated onboardingComplete
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        onboardingComplete: true,
        selectedCategoryId: categoryId,
        selectedCategoryName: category.name,
        selectedCategorySlug: category.slug,
        selectedRole,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding complete",
      category: {
        name: category.name,
        slug: category.slug,
        role: selectedRole,
      },
    });
  } catch (error) {
    console.error("Onboarding POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save onboarding" },
      { status: 500 },
    );
  }
}
