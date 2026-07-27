// scripts/reset-categories.ts
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import connectDB from "../lib/local-db";
import { Category } from "../models/Category";

async function reset() {
  await connectDB();
  await Category.collection.drop();
  console.log("🗑️ Dropped categories collection");
  process.exit(0);
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});