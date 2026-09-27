/**
 * Extracts every individual exam attempt (any status — in_progress,
 * completed, timed_out, abandoned, cheating_detected), one row per exam.
 *
 * Score handling: Exam.score defaults to 0 in the schema, and the real
 * score may only ever get written to a separate Result document by
 * /api/exam/submit rather than back onto the Exam itself. This script
 * uses Exam.score when it's a non-zero value, and falls back to the
 * matching Result.score (joined by examId) otherwise — so it works
 * whichever collection actually holds the real number for your data.
 *
 * Run with:
 *   npx tsx scripts/extract-exam-takers.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Exam from "@/models/Exam";
import { Result } from "@/models/ExamResults";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Aborting.");
  process.exit(1);
}

interface ExamRow {
  examId: string;
  userId: string;
  name: string;
  email: string;
  categoryName: string;
  skillLevel: string;
  status: string;
  passed: boolean;
  score: number | null;
  scoreSource: "exam" | "result" | "none";
  correctCount: number;
  totalQuestions: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

async function run() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection;

  const exams = await Exam.find()
    .select(
      "userId userName categoryName skillLevel status passed score correctCount totalQuestions startedAt completedAt",
    )
    .sort({ startedAt: -1 })
    .lean();

  console.log(`Found ${exams.length} exam attempt(s).`);

  // Pull every Result in one query rather than one lookup per exam
  const results = await Result.find().select("examId score").lean();
  const resultByExamId = new Map(
    results.map((r: any) => [r.examId?.toString(), r.score]),
  );

  const rows: ExamRow[] = [];
  let zeroExamScoreCount = 0;
  let recoveredFromResultCount = 0;

  for (const exam of exams as any[]) {
    let user: any = null;
    try {
      user = await db
        .collection("user")
        .findOne({ _id: new mongoose.Types.ObjectId(exam.userId) });
    } catch {
      // userId wasn't a valid ObjectId string — skip lookup, keep the row
    }

    let score: number | null = null;
    let scoreSource: ExamRow["scoreSource"] = "none";

    if (typeof exam.score === "number" && exam.score > 0) {
      score = exam.score;
      scoreSource = "exam";
    } else {
      zeroExamScoreCount++;
      const resultScore = resultByExamId.get(exam._id.toString());
      if (typeof resultScore === "number") {
        score = resultScore;
        scoreSource = "result";
        recoveredFromResultCount++;
      }
    }

    rows.push({
      examId: exam._id.toString(),
      userId: exam.userId,
      name: user?.name ?? exam.userName ?? "(unknown)",
      email: user?.email ?? "(unknown)",
      categoryName: exam.categoryName,
      skillLevel: exam.skillLevel,
      status: exam.status,
      passed: exam.passed,
      score,
      scoreSource,
      correctCount: exam.correctCount ?? 0,
      totalQuestions: exam.totalQuestions ?? 0,
      startedAt: exam.startedAt ?? null,
      completedAt: exam.completedAt ?? null,
    });
  }

  console.log(
    `Exam.score was 0/missing on ${zeroExamScoreCount} row(s); recovered a real score from Result for ${recoveredFromResultCount} of those.`,
  );
  if (zeroExamScoreCount > recoveredFromResultCount) {
    console.log(
      `${zeroExamScoreCount - recoveredFromResultCount} row(s) still have no score anywhere — likely in_progress/abandoned attempts that never completed.`,
    );
  }

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "exam-takers.json");
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

  const csvHeader =
    "examId,userId,name,email,categoryName,skillLevel,status,passed,score,scoreSource,correctCount,totalQuestions,startedAt,completedAt";
  const csvRows = rows.map((r) =>
    [
      r.examId,
      r.userId,
      `"${(r.name ?? "").replace(/"/g, '""')}"`,
      r.email,
      `"${(r.categoryName ?? "").replace(/"/g, '""')}"`,
      r.skillLevel,
      r.status,
      r.passed,
      r.score ?? "",
      r.scoreSource,
      r.correctCount,
      r.totalQuestions,
      r.startedAt?.toISOString() ?? "",
      r.completedAt?.toISOString() ?? "",
    ].join(","),
  );
  const csvPath = path.join(outDir, "exam-takers.csv");
  fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"));

  console.log(`Wrote ${rows.length} row(s) to:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${csvPath}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
