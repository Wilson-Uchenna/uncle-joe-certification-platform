"use client";

import { Timer } from "./Timer";
import { Save } from "lucide-react";
import { Category } from "@/types/exam";

interface ExamHeaderProps {
  category: Category;
  selectedRole: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  saving?: boolean;
}

export function ExamHeader({
  category,
  selectedRole,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  saving = false,
}: ExamHeaderProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-bold text-[#1e1b4b]">
              {category.name}
            </h2>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {selectedRole}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Save className="w-3 h-3" />
              Saving...
            </span>
          )}
          <Timer timeRemaining={timeRemaining} />
        </div>
      </div>

      <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-violet-800 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}