// scripts/export-users.ts
//
// Exports every user's name and email to a CSV file.
//
// Usage:
//   npx tsx scripts/export-users.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import fs from "fs";
import path from "path";

async function run() {
  await connectDB();

  const users = await mongoose.connection
    .collection("user")
    .find({})
    .project({ name: 1, email: 1, createdAt: 1 })
    .toArray();

  console.log(`Found ${users.length} users.`);

  const header = "name,email,createdAt\n";
  const rows = users
    .map((u: any) => {
      // Basic CSV-safe escaping — wraps in quotes if it contains a comma or quote
      const escape = (val: any) => {
        const str = String(val ?? "");
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      return [escape(u.name), escape(u.email), escape(u.createdAt?.toISOString?.() ?? u.createdAt)].join(",");
    })
    .join("\n");

  const outPath = path.join(process.cwd(), "users-export.csv");
  fs.writeFileSync(outPath, header + rows);

  console.log(`Written to ${outPath}`);

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});