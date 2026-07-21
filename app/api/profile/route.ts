// app/api/user/profile/route.ts
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";
import mongoose from "mongoose";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Better Auth stores users in a collection — fetch the full document
    const userCollection = mongoose.connection.collection("user");
    const user = await userCollection.findOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      {
        projection: {
           name: 1,
          email: 1,
          image: 1,
          fullName: 1,
          phone: 1,
          employer: 1,
          state: 1,
          country: 1,
          role: 1,
          onboardingComplete: 1,
          selectedCategoryId: 1,
          selectedCategoryName: 1,
          selectedCategorySlug: 1,
          selectedRole: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Flatten the response for the frontend
    const profile = {
      full_name: user.fullName || user.name || session.user.name || "",
      email: user.email || session.user.email || "",
      phone: user.phone || "",
      school: user.employer || "",
      state: user.state || "",
      country: user.country || "",
      role: user.role || "user",
      onboardingComplete: user.onboardingComplete ?? false,
      selectedCategoryId: user.selectedCategoryId?.toString() || null,
      selectedCategoryName: user.selectedCategoryName || null,
      selectedCategorySlug: user.selectedCategorySlug || null,
      selectedRole: user.selectedRole || null,
    };

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


// app/api/user/profile/route.ts (add PATCH)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { full_name, phone, school, state, country } = body;

    await connectDB();

    const userCollection = mongoose.connection.collection("user");

    const updateDoc: Record<string, unknown> = {};
    if (full_name !== undefined)
      updateDoc["additionalFields.fullName"] = full_name;
    if (phone !== undefined) updateDoc["additionalFields.phone"] = phone;
    if (school !== undefined) updateDoc["additionalFields.employer"] = school;
    if (state !== undefined) updateDoc["additionalFields.state"] = state;
    if (country !== undefined)
      updateDoc["additionalFields.country"] = country;

    await userCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $set: updateDoc }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}