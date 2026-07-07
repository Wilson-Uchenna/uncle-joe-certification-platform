"use client";

import { ArrowLeft, ArrowRight, ListOrdered, Check } from "lucide-react";
import { Category } from "@/types/exam";
import { MotivationCard } from "@/app/_components/ui/MotivationCard";
import { GradientButton } from "@/app/_components/ui/GradientButton";

interface Step3InstructionsProps {
  selectedCategory: Category;
  selectedRole: string;
  onBack: () => void;
  onContinue: () => void;
}

const purple = {
  light: "#f3e8ff",
  normal: "#7c3aed",
  dark: "#5b21b6",
};

const instructions = [
  "Choose the area that aligns with your career goals.",
  "Read each category description carefully.",
  "Start with one learning path and expand your skills over time.",
  "Don't worry if you're unsure — you can explore additional categories later.",
];

export function Step3Instructions({
  selectedCategory,
  selectedRole,
  onBack,
  onContinue,
}: Step3InstructionsProps) {
  return (
    <div className="animate-fadeIn">
      {/* Selected State */}
      <div className="bg-white rounded-2xl p-7 text-center border-2 border-violet-600 mb-5">
        <div className="text-[40px] mb-3">🎉</div>
        <h3 className="text-lg font-bold text-[#2e1065] mb-2">
          Excellent choice!
        </h3>
        <p className="text-[13px] text-slate-500 leading-relaxed max-w-[400px] mx-auto mb-4">
          You've selected <strong>{selectedRole}</strong> in{" "}
          <strong>{selectedCategory.name}</strong>. We'll now recommend courses,
          certifications, internships, and career opportunities tailored just
          for you.
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full text-xs font-semibold text-violet-700">
            {selectedCategory.name}
          </span>
          <span className="text-slate-400">→</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 rounded-full text-xs font-semibold text-violet-800">
            {selectedRole}
          </span>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-white rounded-2xl p-6 mb-5 border border-[#e9e4f0]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
            <ListOrdered className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-[15px] font-bold text-[#1e1b4b] uppercase tracking-wide">
            Before You Begin
          </h2>
        </div>

        <div className="flex flex-col">
          {instructions.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0 text-[13px] text-slate-600 leading-relaxed"
            >
              <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-3 text-[12.5px] italic rounded-[10px] px-4 py-3 border-l-[3px]"
          style={{
            background: purple.light,
            color: purple.dark,
            borderColor: purple.normal,
          }}
        >
          Your selected role helps us personalize your exam difficulty and
          recommend the most relevant courses for your career path.
        </div>
      </div>

      {/* Motivation */}
      <MotivationCard
        quote="Every expert was once a beginner. The skills you start learning today could become the opportunities that change your life tomorrow. Keep learning. Keep growing. Keep believing."
        author="— Skillora Team"
      />

      {/* CTAs */}
      <div className="text-center pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium text-slate-500 rounded-[10px] border border-slate-200 mr-3 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <GradientButton onClick={onContinue}>
          <ArrowRight className="w-5 h-5" />
          Start Exam
        </GradientButton>
      </div>
    </div>
  );
}
