"use client";

import { ArrowRight, BookOpen, Check } from "lucide-react";
import { Category } from "@/types/exam";
import { HeroBanner } from "@/app/_components/ui/HeroBanner";
import { WelcomeMessage } from "@/app/_components/ui/WelcomeMessage";
import { GradientButton } from "@/app/_components/ui/GradientButton";

interface Step1CategoryProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (cat: Category) => void;
  onContinue: () => void;
}

export function Step1Category({
  categories,
  selectedCategory,
  onSelect,
  onContinue,
}: Step1CategoryProps) {
  return (
    <div className="animate-fadeIn">
      <HeroBanner
        title="Find the Skills That Match Your Career Goals"
        subtitle="Whether you're preparing for your first job, changing careers, or improving your professional skills, A.R.W.P.C has a learning path designed for you. Select the category that best matches your interests and ambitions."
      />

      <WelcomeMessage
        title="👋 Welcome!"
        message="We're excited to help you discover skills that can transform your future. Choose a category that inspires you, and let's begin building your career together."
      />

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelect(cat)}
            className={`relative text-left p-5 rounded-[14px] border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              selectedCategory?._id === cat._id
                ? "border-violet-600 bg-violet-50 shadow-violet-500/10"
                : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-violet-500/5"
            }`}
          >
            {/* Check indicator */}
            <div
              className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center transition-all duration-200 ${
                selectedCategory?._id === cat._id
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-0"
              }`}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              <h3 className="text-sm font-bold text-[#1e1b4b]">{cat.name}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">{cat.description}</p>

            {/* Roles hint */}
            <div className="flex flex-wrap gap-1">
              {cat.roles.slice(0, 3).map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-full"
                >
                  {role}
                </span>
              ))}
              {cat.roles.length > 3 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-medium rounded-full">
                  +{cat.roles.length - 3} more
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pb-5">
        <GradientButton onClick={onContinue} disabled={!selectedCategory}>
          <ArrowRight className="w-5 h-5" />
          Continue
        </GradientButton>
      </div>
    </div>
  );
}