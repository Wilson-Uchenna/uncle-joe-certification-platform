"use client";

import { MoveLeft, Check, ChevronRight, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  roles: string[];
  examTimeLimit: number;
  passThreshold: number;
};

export default function RoleOnboardingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSkillLevel, setUserSkillLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [step, setStep] = useState<"categories" | "roles">("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
      setCategories(data.categories);
      setUserSkillLevel(data.userSkillLevel);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedRole("");
    setStep("roles");
  };

  const handleBack = () => {
    setStep("categories");
    setSelectedCategory(null);
    setSelectedRole("");
    setSaveError("");
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedRole) return;

    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory._id,
          selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{fetchError}</p>
          <button
            onClick={fetchCategories}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img
            src={"/skillora-3.png"}
            alt="Skillora Logo"
            className="w-28 h-10"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">
            Your skill level:{" "}
            <span className="font-medium capitalize text-gray-700">
              {userSkillLevel}
            </span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "categories"
              ? "Select Your Certification"
              : "Select Your Role"}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === "categories"
              ? "Choose a category that matches your expertise"
              : `Within ${selectedCategory?.name}`}
          </p>
        </div>

        {/* Error */}
        {saveError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {saveError}
          </div>
        )}

        {/* Step 1: Categories */}
        {step === "categories" && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat)}
                className="w-full text-left p-4 border rounded-xl hover:border-blue-500 hover:shadow-md transition group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cat.examTimeLimit} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {cat.passThreshold}% to pass
                  </span>
                  <span>{cat.roles.length} roles</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Roles */}
        {step === "roles" && selectedCategory && (
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <MoveLeft className="w-4 h-4" />
              Back to categories
            </button>

            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <h3 className="font-semibold text-blue-900">
                {selectedCategory.name}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {selectedCategory.description}
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your exact role:
            </label>

            <div className="space-y-2 mb-6">
              {selectedCategory.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedRole === role
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    {selectedRole === role && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedRole || saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              {saving ? "Saving..." : "Complete Onboarding"}
            </button>
          </div>
        )}
      </div>

      {/* Right side — Testimonial */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/testimonial-bg.png"
          alt="Testimonial"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <p className="text-lg leading-relaxed mb-6">
            Skillora is an absolute game-changer. I took the exam, seamlessly
            downloaded my certificate, and landed a remote internship just two
            weeks later.
          </p>

          <div>
            <p className="font-semibold text-lg">Jessica Davis</p>
            <p className="text-sm text-gray-300">Data Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}
