import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newPassword } = await req.json();

  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "newPassword is required" },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    // Admin plugin's setUserPassword — sets a new password directly without
    // requiring the current one, which is what we need here since the temp
    // password's plaintext was never captured client-side.
    await auth.api.setUserPassword({
      body: {
        userId: session.user.id,
        newPassword,
      },
      headers: req.headers,
    });

    // Flip tempPassword to false now that a real password is set
    await auth.api.updateUser({
      body: {
        tempPassword: false,
      },
      headers: req.headers,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change password failed:", err);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}