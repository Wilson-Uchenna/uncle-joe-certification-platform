/**
 * Extracts every user who has ever started/taken an exam (any status —
 * in_progress, completed, timed_out, abandoned, cheating_detected).
 *
 * What it does:
 *  - Gets distinct userId values from the Exam collection
 *  - Looks up each user's basic details from the "user" collection
 *  - Writes the result to:
 *      - exam-takers.json  (full detail)
 *      - exam-takers.csv   (spreadsheet-friendly)
 *
 * Run with:
 *   npx tsx scripts/extract-exam-takers.ts
 *
 * Note: Exam.userId is stored as a String (per your schema), not an
 * ObjectId, so the lookup below casts it to ObjectId for the "user"
 * collection query — adjust if your User _id isn't a standard ObjectId.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Exam from "@/models/Exam";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Aborting.");
  process.exit(1);
}

interface ExamTakerRow {
  userId: string;
  name: string;
  email: string;
  examsTaken: number;
  examsPassed: number;
  firstExamAt: Date | null;
  lastExamAt: Date | null;
}

async function run() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection;

  // Aggregate per-user exam stats directly rather than distinct() + N lookups
  const stats = await Exam.aggregate([
    {
      $group: {
        _id: "$userId",
        examsTaken: { $sum: 1 },
        examsPassed: { $sum: { $cond: ["$passed", 1, 0] } },
        firstExamAt: { $min: "$startedAt" },
        lastExamAt: { $max: "$startedAt" },
      },
    },
  ]);

  console.log(`Found ${stats.length} distinct user(s) with at least one exam.`);

  const rows: ExamTakerRow[] = [];

  for (const s of stats) {
    const rawUserId = s._id as string;

    let user: any = null;
    try {
      user = await db
        .collection("user")
        .findOne({ _id: new mongoose.Types.ObjectId(rawUserId) });
    } catch {
      // userId wasn't a valid ObjectId string — skip lookup, keep the stats row
    }

    rows.push({
      userId: rawUserId,
      name: user?.name ?? "(unknown)",
      email: user?.email ?? "(unknown)",
      examsTaken: s.examsTaken,
      examsPassed: s.examsPassed,
      firstExamAt: s.firstExamAt ?? null,
      lastExamAt: s.lastExamAt ?? null,
    });
  }

  // Sort by most exams taken, descending
  rows.sort((a, b) => b.examsTaken - a.examsTaken);

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "exam-takers.json");
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

  const csvHeader = "userId,name,email,examsTaken,examsPassed,firstExamAt,lastExamAt";
  const csvRows = rows.map((r) =>
    [
      r.userId,
      `"${(r.name ?? "").replace(/"/g, '""')}"`,
      r.email,
      r.examsTaken,
      r.examsPassed,
      r.firstExamAt?.toISOString() ?? "",
      r.lastExamAt?.toISOString() ?? "",
    ].join(",")
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