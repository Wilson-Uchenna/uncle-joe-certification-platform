// scripts/reconcile-pending-payments.ts
//
// For every "pending" Payment, ask Paystack what actually happened.
// If Paystack confirms success (and the amount matches), promote it
// to "success" and run the same unlock logic /api/payment/verify does.
// If Paystack says it failed/abandoned, mark it accordingly.
//
// Usage:
//   npx tsx scripts/reconcile-pending-payments.ts          # dry run
//   npx tsx scripts/reconcile-pending-payments.ts --apply  # writes

import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";
import { paystack } from "@/lib/paystack";

console.log(
  "Key loaded:",
  process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY ? "yes" : "NO — undefined",
  process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY?.slice(0, 8),
);
const key = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY!;
console.log("Key length:", key.length);
console.log(
  "Key JSON (shows hidden chars):",
  JSON.stringify(key.slice(0, 15) + "..." + key.slice(-5)),
);

const DRY_RUN = !process.argv.includes("--apply");

async function run() {
  console.log("Script started at:", new Date().toISOString());
  await connectDB();
  console.log(
    `Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "APPLY (writing to DB)"}`,
  );

  const pendingPayments = await Payment.find({ status: "pending" });
  console.log(
    `Found ${pendingPayments.length} pending payments to check against Paystack.`,
  );

  let confirmedSuccess = 0;
  let confirmedFailed = 0;
  let stillPendingOnPaystack = 0;
  let errors = 0;

  for (const payment of pendingPayments) {
    try {
      const data = await paystack.transaction.verify(payment.providerReference);
      const expectedKobo = payment.amount * 100;

      if (data.status === "success" && data.amount === expectedKobo) {
        confirmedSuccess++;
        console.log(
          `  ✅ ${payment.providerReference} — Paystack confirms success. Would promote.`,
        );

        if (!DRY_RUN) {
          payment.status = "success";
          payment.paidAt = new Date(data.paid_at || Date.now());
          payment.providerTransactionId = data.id?.toString();
          await payment.save();

          const exam = await Exam.findById(payment.examId);
          if (exam) {
            exam.resultsPaidAt = payment.paidAt;
            const resultUpdate: Record<string, any> = {
              resultsPaidAt: payment.paidAt,
            };

            if (exam.passed) {
              exam.certificatePaidAt = payment.paidAt;
              resultUpdate.certificateAvailable = true;
              resultUpdate.certificatePaidAt = payment.paidAt;
            }
            await exam.save();
            await Result.updateOne(
              { examId: payment.examId },
              { $set: resultUpdate },
            );
          } else {
            console.warn(
              `    ⚠️  Exam ${payment.examId} not found — payment updated, exam unlock skipped.`,
            );
          }
        }
      } else if (data.status === "success" && data.amount !== expectedKobo) {
        console.warn(
          `  ⚠️  ${payment.providerReference} — Paystack says success but amount mismatch (got ${data.amount}, expected ${expectedKobo}). Flagging for manual review, not auto-promoting.`,
        );
      } else if (data.status === "failed") {
        confirmedFailed++;
        if (!DRY_RUN) {
          payment.status = "failed";
          payment.failedAt = new Date();
          payment.failureReason = "reconciliation_confirmed_failed";
          await payment.save();
        }
      } else {
        stillPendingOnPaystack++;
        console.log(
          `  ⏳ ${payment.providerReference} — still pending/abandoned on Paystack's side too.`,
        );
      }
    } catch (err: any) {
      errors++;
      console.error(
        `  ❌ ${payment.providerReference} — error checking with Paystack: ${err.message}`,
      );
    }
  }

  console.log("---");
  console.log(`Confirmed success (would unlock): ${confirmedSuccess}`);
  console.log(`Confirmed failed: ${confirmedFailed}`);
  console.log(`Still genuinely pending: ${stillPendingOnPaystack}`);
  console.log(`Errors: ${errors}`);

  if (DRY_RUN) {
    console.log("\nDry run — nothing written. Re-run with --apply to commit.");
  }

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Reconciliation failed:", err);
  process.exit(1);
});
