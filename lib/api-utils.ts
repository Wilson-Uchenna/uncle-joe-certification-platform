import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/local-db";

export async function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth.api.getSession();
      
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      return await handler(req, session.user);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export async function withAuthAndDB(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(async (req, user) => {
    await connectDB();
    return handler(req, user);
  });
}

export async function withAdmin(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuthAndDB(async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}