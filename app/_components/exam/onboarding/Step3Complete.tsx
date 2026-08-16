"use client";

import Link from "next/link";
import { Award, AlertCircle, Check, ArrowRight, Download } from "lucide-react";
import { Category, ExamSubmitResponse } from "@/types/exam";
import { useRouter } from "next/navigation";

interface Step3CompleteProps {
  category: Category;
  selectedRole: string;
  result: ExamSubmitResponse;
  onRestart: () => void;
}

const purple = {
  normal: "#7c3aed",
  dark: "#5b21b6",
  darker: "#2e1065",
};

export function Step3Complete({
  category,
  selectedRole,
  result,
  onRestart,
}: Step3CompleteProps) {
  const router = useRouter();
  const passed = result.passed;
  const examId = result.examId;
  const score = result.score;

  const handleDownloadCertificate = () => {
    const now = new Date().getTime();
    const availableAt = new Date(result.resultsAvailableAt).getTime();

    if (now >= availableAt) {
      router.push(`/certificates/payments?examId=${examId}&score=${score}`);
    } else {
      // Embargo still active — send them to the results page,
      // which already shows the countdown until it lifts
      router.push(`/results/${examId}`);
    }
  };

  return (
    <div className="animate-fadeIn max-w-[600px] mx-auto">
      <div
        className="rounded-[20px] p-10 text-center border mb-5"
        style={{
          background: passed
            ? `linear-gradient(135deg, ${purple.normal}15, #ede4f7)`
            : "linear-gradient(135deg, #fef2f2, #fee2e2)",
          borderColor: passed ? "#d8b4fe" : "#fecaca",
        }}
      >
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
            passed
              ? "bg-gradient-to-br from-violet-600 to-violet-800"
              : "bg-gradient-to-br from-red-500 to-red-700"
          }`}
          style={{
            boxShadow: passed
              ? "0 4px 20px rgba(124, 58, 237, 0.3)"
              : "0 4px 20px rgba(239, 68, 68, 0.3)",
          }}
        >
          {passed ? (
            <Award className="w-10 h-10 text-white" />
          ) : (
            <AlertCircle className="w-10 h-10 text-white" />
          )}
        </div>

        <h2
          className="text-xl font-bold mb-2"
          style={{ color: passed ? purple.darker : "#991b1b" }}
        >
          {passed
            ? "Assessment Submitted Successfully!"
            : "Assessment Submitted"}
        </h2>

        <p
          className="text-sm leading-relaxed max-w-[400px] mx-auto mb-4"
          style={{ color: passed ? "#6b21a8" : "#b91c1c" }}
        >
          {passed
            ? "Fantastic work! Your responses have been received successfully. You passed the assessment and earned your certification!"
            : "Your assessment has been submitted. Unfortunately, you didn't meet the passing threshold this time. Review your weak areas and try again!"}
        </p>

        {/* Category + Role */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-violet-700">
            {category.name}
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-violet-800">
            {selectedRole}
          </span>
        </div>

      

        {passed && result.certificateAvailable && (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
              <Check className="w-4 h-4" />
              Passed — Certificate Earned!
            </div>
            <button
              className="mt-2 inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors"
              onClick={handleDownloadCertificate}
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </button>
          </div>
        )}
      </div>

      <div className="block md:flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 text-sm font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Retake Exam
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${purple.normal}, ${purple.dark})`,
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          <ArrowRight className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          href={`/results/${result.examId}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${purple.normal}, ${purple.dark})`,
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          View Full Results
        </Link>
      </div>
    </div>
  );
}