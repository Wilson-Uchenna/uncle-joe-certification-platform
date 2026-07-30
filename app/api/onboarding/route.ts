import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import { Category } from "@/models/Category";
import { OnboardingCompleteEmail } from "@/app/_components/emails/onBoardingEmailComplete";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET handler unchanged — omitted here for brevity

// POST: Save onboarding selection
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { categoryId, selectedRole } = body;

    const missing: string[] = [];
    if (!categoryId) missing.push("categoryId");
    if (!selectedRole) missing.push("selectedRole");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing fields: ${missing.join(", ")}`,
          received: body,
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid categoryId format" },
        { status: 400 },
      );
    }

    await connectDB();

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    if (!category.roles?.includes(selectedRole)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role for category",
          available: category.roles,
        },
        { status: 400 },
      );
    }

    const usersCollection = mongoose.connection.collection("user");

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      {
        $set: {
          onboardingComplete: true,
          selectedCategoryId: new mongoose.Types.ObjectId(categoryId),
          selectedCategoryName: category.name,
          selectedCategorySlug: category.slug,
          selectedRole,
          updatedAt: new Date(),
        },
      },
    );

    // Send confirmation email — non-blocking failure so onboarding
    // still succeeds even if the email send has an issue
    try {
      await resend.emails.send({
        from: "A.R.W.P.C <noreply@send.exams1.name.ng>",
        to: session.user.email,
        subject: "You're all set — we'll notify you when your exam is ready",
        react: OnboardingCompleteEmail({ name: session.user.name }),
      });
    } catch (emailErr) {
      console.error("Failed to send onboarding completion email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding complete",
      category: {
        name: category.name,
        slug: category.slug,
        role: selectedRole,
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 },
    );
  }
}