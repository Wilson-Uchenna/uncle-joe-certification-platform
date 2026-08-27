// scripts/find-unrecorded-payments.ts
//
// Pulls every successful transaction from Paystack in the last 30 days
// and checks each one against the local Payment collection. Reports:
// - transactions with no matching Payment doc at all (never recorded locally)
// - transactions where the local record's status doesn't say "success"
//
// This is the REVERSE direction from reconcile-pending-payments.ts —
// it starts from Paystack's truth, not your database's.
//
// Usage:
//   npx tsx scripts/find-unrecorded-payments.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { paystack } from "@/lib/paystack";

async function run() {
  await connectDB();

  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  console.log(`Checking Paystack successful transactions from ${from.toISOString()} to ${to.toISOString()}`);

  let page = 1;
  let allTransactions: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const batch = await paystack.transaction.list({
      status: "success",
      from: from.toISOString(),
      to: to.toISOString(),
      page,
      perPage: 100,
    });

    allTransactions = allTransactions.concat(batch);
    hasMore = batch.length === 100;
    page++;
  }

  console.log(`Found ${allTransactions.length} successful transactions on Paystack in this window.\n`);

  let matchedAndCorrect = 0;
  let missingEntirely: any[] = [];
  let mismatchedStatus: any[] = [];

  for (const txn of allTransactions) {
    const localPayment = await Payment.findOne({ providerReference: txn.reference });

    if (!localPayment) {
      missingEntirely.push(txn);
      continue;
    }

    if (localPayment.status !== "success") {
      mismatchedStatus.push({ txn, localStatus: localPayment.status, localAmount: localPayment.amount });
      continue;
    }

    matchedAndCorrect++;
  }

  console.log(`✅ Correctly recorded as success locally: ${matchedAndCorrect}`);
  console.log(`\n❗ Successful on Paystack but NO local Payment record at all: ${missingEntirely.length}`);
  for (const txn of missingEntirely) {
    console.log(
      `   ${txn.reference} — ₦${(txn.amount / 100).toLocaleString()} — ${txn.customer?.email} — paid at ${txn.paid_at}`,
    );
  }

  console.log(`\n⚠️  Successful on Paystack but local record says something else: ${mismatchedStatus.length}`);
  for (const { txn, localStatus, localAmount } of mismatchedStatus) {
    console.log(
      `   ${txn.reference} — Paystack: ₦${(txn.amount / 100).toLocaleString()} success — Local: status="${localStatus}", amount=₦${localAmount}`,
    );
  }

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});