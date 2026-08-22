// scripts/backfill-exam-attempts.ts
import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { Exam, ExamStatus } from "@/models/Exam";
import { ExamAttempt, AttemptStatus, AttemptEndReason } from "@/models/ExamAttempts";
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });


const DRY_RUN = !process.argv.includes("--apply");

function mapExamStatus(status: ExamStatus): {
  attemptStatus: AttemptStatus;
  endReason?: AttemptEndReason;
} {
  switch (status) {
    case "in_progress":
      return { attemptStatus: "in_progress" };
    case "completed":
      return { attemptStatus: "completed", endReason: "submitted" };
    case "timed_out":
      return { attemptStatus: "completed", endReason: "timed_out" };
    case "abandoned":
      return { attemptStatus: "terminated", endReason: "abandoned" };
    case "cheating_detected":
      return { attemptStatus: "terminated", endReason: "cheating_detected" };
    default:
      return { attemptStatus: "terminated", endReason: "abandoned" };
  }
}

async function run() {
  await connectDB();
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "APPLY (writing to DB)"}`);

  const existingKeys = new Set(
    (await ExamAttempt.find({}).lean()).map(
      (d: any) => `${d.userId}::${d.categoryId}::${d.skillLevel}`,
    ),
  );
  console.log(`Found ${existingKeys.size} existing ExamAttempt documents — will skip these groups.`);

  const allExams = await Exam.find({}).sort({ startedAt: 1, createdAt: 1 }).lean();
  console.log(`Total Exam documents: ${allExams.length}`);

  const groups = new Map<string, typeof allExams>();
  for (const exam of allExams) {
    if (!exam.userId || !exam.categoryId || !exam.skillLevel) continue;
    const key = `${exam.userId}::${exam.categoryId}::${exam.skillLevel}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(exam);
  }
  console.log(`Grouped into ${groups.size} distinct (user, category, skillLevel) combinations.`);

  const toInsert: any[] = [];
  let skippedGroups = 0;

  for (const [key, examsInGroup] of groups) {
    if (existingKeys.has(key)) {
      skippedGroups++;
      continue;
    }

    const [userId, categoryId, skillLevel] = key.split("::");
    const attempts = examsInGroup.map((exam, index) => {
      const { attemptStatus, endReason } = mapExamStatus(exam.status);
      const entry: any = {
        examId: exam._id,
        attemptNumber: index + 1,
        status: attemptStatus,
        startedAt: exam.startedAt || exam.createdAt,
      };
      if (endReason) entry.endReason = endReason;
      if (attemptStatus !== "in_progress") {
        entry.endedAt = exam.completedAt || exam.updatedAt || exam.startedAt;
      }
      return entry;
    });

    toInsert.push({ userId, categoryId, skillLevel, attempts });
  }

  console.log(`Would create ${toInsert.length} ExamAttempt documents, skip ${skippedGroups} (already backfilled).`);

  const multiAttemptDocs = toInsert.filter((d) => d.attempts.length > 1).slice(0, 3);
  if (multiAttemptDocs.length > 0) {
    console.log("\nSample of documents with multiple attempts (for sanity-checking):");
    for (const d of multiAttemptDocs) {
      console.log(
        `  ${d.userId}::${d.categoryId}::${d.skillLevel} — ${d.attempts.length} attempts, in order: ${d.attempts
          .map((a: any) => a.status)
          .join(" -> ")}`,
      );
    }
  }

  if (!DRY_RUN && toInsert.length > 0) {
    await ExamAttempt.insertMany(toInsert, { ordered: false });
    console.log(`Inserted ${toInsert.length} ExamAttempt documents.`);
  } else if (DRY_RUN) {
    console.log("\nDry run — nothing written. Re-run with --apply to commit.");
  }

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});