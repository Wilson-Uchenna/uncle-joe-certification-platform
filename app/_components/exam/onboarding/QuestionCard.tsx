"use client";

import { Flag } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    question: string;
    options: string[];
  };
  selectedOptionIndex?: number;
  isFlagged: boolean;
  onSelectOption: (optionIndex: number) => void;
  onToggleFlag: () => void;
}

export function QuestionCard({
  question,
  selectedOptionIndex,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-slate-900 leading-relaxed pr-4">
          {question.question}
        </h3>
        <button
          onClick={onToggleFlag}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
            isFlagged
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          {isFlagged ? "Flagged" : "Flag"}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index;
          return (
            <button
              key={index}
              onClick={() => onSelectOption(index)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-150 text-[13.5px] ${
                isSelected
                  ? "border-violet-600 bg-violet-50 text-violet-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-violet-600 bg-violet-600"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}