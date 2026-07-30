// app/api/cron/send-result-emails/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import Result from "@/models/ExamResults";
import { ResultsReadyEmail } from "@/app/_components/emails/ResultsReady";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();

  const dueResults = await Result.find({
    resultsAvailableAt: { $lte: now },
    resultEmailSentAt: null,
  });

  // Better Auth manages its own collection via the native driver —
  // no Mongoose schema exists for it, so query it directly.

  const userCollection = mongoose.connection.collection("user"); // confirm this matches Better Auth's actual collection name

  for (const result of dueResults) {
    try {
      const user = await userCollection.findOne({
        _id: result.userId,
      });

      if (!user?.email) {
        console.error(`No user/email found for result ${result._id}`);
        continue;
      }

      await resend.emails.send({
        from: "A.R.W.P.C <results@send.exams1.name.ng>",
        to: user.email,
        subject: "Your assessment results are ready",
        react: ResultsReadyEmail({
          name: result.userName,
          score: result.score,
          passed: result.passed,
          resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/results/${result.examId}`,
        }),
      });

      await Result.findByIdAndUpdate(result._id, {
        resultEmailSentAt: now,
      });
    } catch (err) {
      console.error(`Failed to send result email for ${result._id}`, err);
    }
  }

  return NextResponse.json({ sent: dueResults.length });
}
