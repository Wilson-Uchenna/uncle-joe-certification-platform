"use client";
import Link from "next/link";
import { FileCheck, ArrowRight } from "lucide-react";
import { Category, ExamSubmitResponse } from "@/types/exam";

interface Step3CompleteProps {
  category: Category;
  selectedRole: string;
  result: ExamSubmitResponse;
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
}: Step3CompleteProps) {
  return (
    <div className="animate-fadeIn max-w-[600px] mx-auto">
      <div
        className="rounded-[20px] p-10 text-center border mb-5"
        style={{
          background: `linear-gradient(135deg, ${purple.normal}15, #ede4f7)`,
          borderColor: "#d8b4fe",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-violet-600 to-violet-800"
          style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)" }}
        >
          <FileCheck className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: purple.darker }}>
          Assessment Submitted!
        </h2>
        <p
          className="text-sm leading-relaxed max-w-[400px] mx-auto mb-4"
          style={{ color: "#6b21a8" }}
        >
          Your responses have been received successfully. Your results are
          being processed and will be available soon.
        </p>
        {/* Category + Role */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-violet-700">
            {category.name}
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-violet-800">
            {selectedRole}
          </span>
        </div>
      </div>
      <div className="flex-col md:flex gap-3 justify-center items-center flex md:flex-row">
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