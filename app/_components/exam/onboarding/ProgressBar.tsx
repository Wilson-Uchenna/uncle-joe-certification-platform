"use client";

import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  { num: 1, label: "Category" },
  { num: 2, label: "Role" },
  { num: 3, label: "Instructions" },
  { num: 4, label: "Exam" },
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 px-5">
      {steps.map((step, i) => {
        let status: "completed" | "active" | "pending" = "pending";
        if (step.num < currentStep) status = "completed";
        else if (step.num === currentStep) status = "active";

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                  status === "active"
                    ? "bg-gradient-to-br from-violet-600 to-violet-800 text-white border-transparent shadow-lg shadow-violet-500/30"
                    : status === "completed"
                    ? "bg-emerald-500 text-white border-transparent"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                {status === "completed" ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider hidden sm:block ${
                  status === "active"
                    ? "text-violet-800"
                    : status === "completed"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-[3px] rounded-full sm:mb-2 md:mb-6 mx-1.5 sm:mx-2 transition-all duration-400 fog ${
                  step.num < currentStep
                    ? "bg-emerald-500"
                    : step.num === currentStep
                    ? "bg-gradient-to-r from-emerald-500 to-violet-600"
                    : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}