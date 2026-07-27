"use client";

import { ArrowLeft, ArrowRight, Check, Briefcase } from "lucide-react";
import { Category } from "@/types/exam";
import { GradientButton } from "@/app/_components/ui/GradientButton";

interface Step2RoleSelectionProps {
  selectedCategory: Category;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function Step2RoleSelection({
  selectedCategory,
  selectedRole,
  onSelectRole,
  onBack,
  onContinue,
}: Step2RoleSelectionProps) {
  return (
    <div className="animate-fadeIn">
      {/* Category confirmation */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-[#e9e4f0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Selected Category
            </p>
            <h3 className="text-sm font-bold text-[#1e1b4b]">{selectedCategory.name}</h3>
          </div>
        </div>
      </div>

      {/* Role selection */}
      <div className="bg-white rounded-2xl p-6 mb-5 border border-[#e9e4f0]">
        <h2 className="text-[15px] font-bold text-[#1e1b4b] uppercase tracking-wide mb-2">
          Choose Your Role
        </h2>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
          Select the specific role within <strong>{selectedCategory.name}</strong> that best
          matches your career target. This helps us tailor your exam and learning path.
        </p>

        <div className="flex flex-col gap-2.5">
          {selectedCategory.roles.map((role) => (
            <button
              key={role}
              onClick={() => onSelectRole(role)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedRole === role
                  ? "border-violet-600 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedRole === role
                        ? "border-violet-600 bg-violet-600"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedRole === role && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-[13.5px] font-medium text-slate-700">{role}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="text-center pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium text-slate-500 rounded-[10px] border border-slate-200 mr-3 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <GradientButton onClick={onContinue} disabled={!selectedRole}>
          <ArrowRight className="w-5 h-5" />
          Continue
        </GradientButton>
      </div>
    </div>
  );
}