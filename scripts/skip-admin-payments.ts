/**
 * Skips Flutterwave registration payment for admin users.
 *
 * What it does:
 *  - Finds every user with role === "admin" who doesn't already have hasPaid: true
 *  - Sets hasPaid: true directly on their user document
 *  - Creates a matching Payment record (status: "success", amount: 0) so the
 *    payment history / admin dashboards still show a record instead of a gap
 *
 * Run with:
 *   npx tsx scripts/skip-admin-payment.ts
 *
 * Safe to re-run — already-paid admins and already-created Payment records
 * for this purpose are skipped, not duplicated.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { Payment } from "../models/payment";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Aborting.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection;

  // Assumption: admin users live in the "user" collection with a `role` field
  // set to "admin", matching what the rest of the app checks
  // (session.user.role !== "admin"). Adjust the filter below if your actual
  // admin flag is shaped differently (e.g. isAdmin: true).
  const admins = await db
    .collection("user")
    .find({ role: "admin", hasPaid: { $ne: true } })
    .toArray();

  console.log(`Found ${admins.length} admin user(s) without hasPaid: true.`);

  let updated = 0;

  for (const admin of admins) {
    const userId = admin._id;

    // Mark the user as paid
    await db.collection("user").updateOne(
      { _id: userId },
      { $set: { hasPaid: true } }
    );

    // Create an audit-trail Payment record, skipping if one already exists
    // for this user + type (idempotent re-runs)
    const existing = await Payment.findOne({ userId, type: "registration" });

    if (!existing) {
      await Payment.create({
        userId,
        type: "registration",
        amount: 0,
        currency: "NGN",
        provider: "flutterwave",
        providerReference: `ADMIN-WAIVER-${userId}-${Date.now()}`,
        status: "success",
        paidAt: new Date(),
        metadata: {
          reason: "Admin registration fee waived — bypassed Flutterwave",
        },
      });
    }

    updated++;
    console.log(`  ✓ ${admin.email ?? userId} — marked as paid`);
  }

  console.log(`Done. Updated ${updated} admin user(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});