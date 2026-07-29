// app/api/cron/send-result-emails/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import Result from "@/models/ExamResults";
import { ResultsReadyEmail } from "@/app/_components/emails/ResultsReady";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Protect the endpoint
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const dueResults = await Result.find({
    where: {
      resultsAvailableAt: { lte: now },
      resultEmailSentAt: null,
    },
    include: { user: true },
  });

  for (const result of dueResults) {
    try {
      await resend.emails.send({
        from: "A.R.W.P.C <results@send.exams1.name.ng>",
        to: result.user.email,
        subject: "Your assessment results are ready",
        react: ResultsReadyEmail({
          name: result.user.name,
          score: result.score,
          passed: result.passed,
          resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/results/${result.examId}`,
        }),
      });

      await Result.findByIdAndUpdate({
        where: { id: result.id },
        data: { resultEmailSentAt: now },
      });
    } catch (err) {
      console.error(`Failed to send result email for ${result.id}`, err);
      // don't mark as sent — it'll retry next run
    }
  }

  return NextResponse.json({ sent: dueResults.length });
}