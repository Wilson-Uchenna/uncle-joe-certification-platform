"use client";

import { AlertCircle } from "lucide-react";

interface SubmitModalProps {
  unansweredCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitModal({ unansweredCount, onCancel, onConfirm }: SubmitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Submit Assessment?</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed mb-2">
          You have <strong>{unansweredCount}</strong> unanswered question(s). Once
          submitted, you cannot change your answers.
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Review Answers
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  );
}