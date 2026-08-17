"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category, ExamSubmitResponse } from "@/types/exam";
import { ProgressBar } from "@/app/_components/exam/onboarding/ProgressBar";
import { Step1Category } from "@/app/_components/exam/onboarding/Step1Category";
import { Step2RoleSelection } from "@/app/_components/exam/onboarding/Step2RoleSelection";
import { Step3Instructions } from "@/app/_components/exam/onboarding/Step3Instructions";
import { Step3Exam } from "@/app/_components/exam/onboarding/Step3Exam";
import { Step3Complete } from "@/app/_components/exam/onboarding/Step3Complete";

export default function ExamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<"entry" | "mid" | "advanced" | null>(null);
  const [examResult, setExamResult] = useState<ExamSubmitResponse | null>(null);

  // API state
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSkillLevel, setUserSkillLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/onboarding", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch categories");
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data.categories);
      setUserSkillLevel(data.userSkillLevel);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedRole(""); // Reset role when category changes
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleSkillLevelSelect = (level: "entry" | "mid" | "advanced") => {
    setSelectedSkillLevel(level);
    setCurrentStep(4);
  };

  const handleExamSubmit = (result: ExamSubmitResponse) => {
    setExamResult(result);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedRole("");
    setSelectedSkillLevel(null);
    setExamResult(null);
    fetchCategories();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-sm">{fetchError}</p>
          <button
            onClick={fetchCategories}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty categories state
  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            No Categories Available
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            No learning categories found for your skill level: <strong>{userSkillLevel}</strong>.
            Please contact support or try again later.
          </p>
          <button
            onClick={fetchCategories}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7fb]">
      <div className="max-w-[800px] mx-auto py-8 px-5">
        <ProgressBar currentStep={currentStep} />

        {currentStep === 1 && (
          <Step1Category
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            onContinue={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && selectedCategory && (
          <Step2RoleSelection
            selectedCategory={selectedCategory}
            selectedRole={selectedRole}
            onSelectRole={handleRoleSelect}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && selectedCategory && selectedRole && (
          <Step3Instructions
            selectedCategory={selectedCategory}
            selectedRole={selectedRole}
            onBack={() => setCurrentStep(2)}
            onContinue={handleSkillLevelSelect}
          />
        )}

        {currentStep === 4 && selectedCategory && selectedRole && selectedSkillLevel && !examResult && (
          <Step3Exam
            category={selectedCategory}
            selectedRole={selectedRole}
            skillLevel={selectedSkillLevel}
            onSubmit={handleExamSubmit}
          />
        )}

        {currentStep === 4 && selectedCategory && selectedRole && selectedSkillLevel && examResult && (
          <Step3Complete
            category={selectedCategory}
            selectedRole={selectedRole}
            result={examResult}
            
          />
        )}
      </div>
    </div>
  );
}