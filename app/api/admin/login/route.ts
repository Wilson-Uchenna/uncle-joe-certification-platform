import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    // Connect directly to DB
    await mongoose.connect(process.env.MONGODB_URI!);
    const db = mongoose.connection.db;
    if (!db) {
      await mongoose.disconnect();
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Find user directly
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      await mongoose.disconnect();
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check admin role
    if (user.role !== "admin") {
      await mongoose.disconnect();
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Verify password directly with bcrypt
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await mongoose.disconnect();
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await mongoose.disconnect();

    // Return success with user data
    // Frontend will store in localStorage and redirect
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}