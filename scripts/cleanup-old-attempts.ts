// scripts/cleanup-old-exam-attempts.ts
import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { ExamAttempt } from "@/models/ExamAttempts";
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  await connectDB();
  const count = await ExamAttempt.countDocuments({});
  console.log(`This will delete ALL ${count} ExamAttempt documents.`);

  if (!process.argv.includes("--apply")) {
    console.log("Dry run — nothing deleted. Re-run with --apply to actually delete.");
    await mongoose.connection.close();
    return;
  }

  const result = await ExamAttempt.deleteMany({});
  console.log(`Deleted ${result.deletedCount} documents.`);
  await mongoose.connection.close();
}

run();