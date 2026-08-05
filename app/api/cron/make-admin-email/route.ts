// app/api/cron/send-admin-welcome-emails/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { AdminWelcomeEmail } from "@/app/_components/emails/AdminWelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userCollection = mongoose.connection.collection("user");

  // Anyone promoted to admin who hasn't been notified yet.
  // adminNotifiedAt acts the same way resultEmailSentAt does —
  // it makes this safe to run on a repeating schedule without
  // ever double-emailing the same admin.
  const pendingAdmins = await userCollection
    .find({
      role: "admin",
      adminNotifiedAt: { $exists: false },
    })
    .toArray();

  let sentCount = 0;

  for (const user of pendingAdmins) {
    try {
      if (!user.email) {
        console.error(`No email found for user ${user._id}`);
        continue;
      }

      await resend.emails.send({
        from: "A.R.W.P.C <admin@send.exams1.name.ng>",
        to: user.email,
        subject: "You've been made an admin",
        react: AdminWelcomeEmail({
          name: user.fullName || user.name || "there",
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
        }),
      });

      await userCollection.updateOne(
        { _id: user._id },
        { $set: { adminNotifiedAt: new Date() } },
      );

      sentCount++;
    } catch (err) {
      console.error(`Failed to send admin welcome email for ${user._id}`, err);
    }
  }

  return NextResponse.json({ sent: sentCount, found: pendingAdmins.length });
}