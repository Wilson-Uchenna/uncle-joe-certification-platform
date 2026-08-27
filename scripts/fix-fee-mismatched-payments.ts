// scripts/fix-fee-mismatched-payments.ts
//
// One-time fix for payments that succeeded on Paystack with the fee
// included (customer bore the fee), but were wrongly marked
// failed/pending locally because the old amount check was too strict.
//
// Usage:
//   npx tsx scripts/fix-fee-mismatched-payments.ts          # dry run
//   npx tsx scripts/fix-fee-mismatched-payments.ts --apply  # writes

import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "@/lib/local-db";
import { Payment } from "@/models/payment";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/ExamResults";
import { paystack } from "@/lib/paystack";

const DRY_RUN = !process.argv.includes("--apply");

// The 48 references confirmed as real fee-inclusive successes
const REFERENCES = [
  "RES-1787657382671-SLXNX6", "RES-1787653566063-JXZ7IK", "RES-1787636201795-248ZW8",
  "CERT-1787629578577-49AS31", "CERT-1787610381934-9RCQTV", "CERT-1787606331876-QGR5CO",
  "CERT-1787603184434-XVLGY1", "CERT-1787596842842-TGT77V", "CERT-1787582466450-CE9DNN",
  "CERT-1787564356441-ZRR3T8", "CERT-1787564144226-9TNA1I", "CERT-1787551845630-2A4H08",
  "CERT-1787524061958-Y8CMAW", "CERT-1787517023440-5NHUJM", "CERT-1787515630766-H6AVN8",
  "CERT-1787515485677-B6UM0B", "CERT-1787515276398-7NPG5Z", "CERT-1787515039656-A1U2S3",
  "CERT-1787514312333-68JRQP", "CERT-1787501173871-B2QPZ7", "CERT-1787496744521-CGLYX4",
  "CERT-1787492118443-53H5V7", "CERT-1787486460231-JNGINH", "CERT-1787469583989-SDWR29",
  "CERT-1787427743008-AVES67", "CERT-1787424393146-3ONFZB", "CERT-1787423474511-CUKOTQ",
  "CERT-1787421922564-RCURCB", "CERT-1787420774839-3JB021", "CERT-1787414761748-JG2RWO",
  "CERT-1787412840596-17PDG6", "CERT-1787406564001-FBAXT3", "CERT-1787399050837-B49YT8",
  "CERT-1787395899257-09ISYX", "CERT-1787390272640-24ML4K", "CERT-1787364584160-SLIGSO",
  "CERT-1787347049934-RDE37Y", "CERT-1787343128709-LWI8DR", "CERT-1787334204942-9RJW0X",
  "CERT-1787331069908-HBSST3", "CERT-1787326249706-D07QW0", "CERT-1787309637700-LI83K7",
  "CERT-1787305487345-J7Q622", "CERT-1787290491916-LPBKIS", "CERT-1787249946400-TBPOWL",
  "CERT-1787249177817-D8MAZ7", "CERT-1787246427037-E3IYIZ", "CERT-1787228162598-1QSWFM",
];

async function run() {
  await connectDB();
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "APPLY (writing to DB)"}`);
  console.log(`Fixing ${REFERENCES.length} references.\n`);

  let fixed = 0;
  let skipped = 0;

  for (const reference of REFERENCES) {
    const payment = await Payment.findOne({ providerReference: reference });
    if (!payment) {
      console.log(`  ⚠️  ${reference} — no local Payment doc found. Skipping.`);
      skipped++;
      continue;
    }

    if (payment.status === "success") {
      console.log(`  ✅ ${reference} — already marked success. Skipping.`);
      skipped++;
      continue;
    }

    // Re-confirm directly with Paystack before touching anything
    const data = await paystack.transaction.verify(reference);
    if (data.status !== "success") {
      console.log(`  ⚠️  ${reference} — Paystack no longer shows success (${data.status}). Skipping.`);
      skipped++;
      continue;
    }

    console.log(`  ✅ ${reference} — confirmed. Would fix.`);
    fixed++;

    if (!DRY_RUN) {
      payment.status = "success";
      payment.paidAt = new Date(data.paid_at || Date.now());
      payment.providerTransactionId = data.id?.toString();
      await payment.save();

      const exam = await Exam.findById(payment.examId);
      if (exam) {
        exam.resultsPaidAt = payment.paidAt;
        const resultUpdate: Record<string, any> = { resultsPaidAt: payment.paidAt };

        if (exam.passed) {
          exam.certificatePaidAt = payment.paidAt;
          resultUpdate.certificateAvailable = true;
          resultUpdate.certificatePaidAt = payment.paidAt;
        }
        await exam.save();
        await Result.updateOne({ examId: payment.examId }, { $set: resultUpdate });
      } else {
        console.log(`     ⚠️  Exam ${payment.examId} not found — payment fixed, but exam unlock skipped.`);
      }
    }
  }

  console.log(`\n${DRY_RUN ? "Would fix" : "Fixed"}: ${fixed}`);
  console.log(`Skipped: ${skipped}`);

  if (DRY_RUN) {
    console.log("\nDry run — nothing written. Re-run with --apply to commit.");
  }

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});