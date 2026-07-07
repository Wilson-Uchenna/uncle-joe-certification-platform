"use client";

import { Check, Flag, AlertCircle, Send } from "lucide-react";

interface ExamStatsProps {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onSubmit: () => void;
  submitting?: boolean;
}

const purple = {
  normal: "#7c3aed",
  dark: "#5b21b6",
};

export function ExamStats({
  totalQuestions,
  answeredCount,
  flaggedCount,
  onSubmit,
  submitting = false,
}: ExamStatsProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-violet-600" />
            {answeredCount} answered
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-amber-500" />
            {flaggedCount} flagged
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            {totalQuestions - answeredCount} unanswered
          </span>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            background: `linear-gradient(135deg, ${purple.normal}, ${purple.dark})`,
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}