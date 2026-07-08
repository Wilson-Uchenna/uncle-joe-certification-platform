"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, Save, FileSpreadsheet, AlertCircle, BarChart3, Lock } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Category = {
  id: string;
  name: string;
  slug: string;
  skillLevel: string;
  description: string;
  examTimeLimit: number;
  passThreshold: number;
  roles: string[];
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
  isFinalStage: boolean;
  role: string;
};

export default function AssessmentManagement() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchCategories();
  }, [session]);

  const fetchCategories = async () => {
    const res = await fetch("/api/onboarding");
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id) || null;
    setSelectedCategory(cat);
    setQuestions([]); // Clear questions when category changes
  };

  const addQuestion = () => {
    const defaultRole = questions[0]?.role || selectedCategory?.roles[0] || "";
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: 1,
        isFinalStage: false,
        role: defaultRole,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // If changing the first question's role, cascade to all other questions
    if (index === 0 && field === "role" && value) {
      for (let i = 1; i < updated.length; i++) {
        updated[i].role = value;
      }
    }
    
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    
    // If removing the first question, the new first question becomes the master
    // No automatic cascade — let the user set it manually
  };

  const validateQuestions = () => {
    if (!categoryId) return "Select a category";
    if (questions.length === 0) return "Add at least one question";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1}: text is required`;
      if (q.options.some((o) => !o.trim())) return `Question ${i + 1}: all options required`;
      if (selectedCategory?.roles.length && !q.role) {
        return `Question ${i + 1}: select a sub-role`;
      }
    }
    return null;
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    const validationError = validateQuestions();
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, questions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(`Successfully uploaded ${data.count} questions`);
      setQuestions([]);
      setCategoryId("");
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || "Unable to complete this action. Please try again.");
    }
    setUploading(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");

    const file = e.target.files?.[0];
    if (!file) return;
    if (!categoryId) {
      setError("Select a category before uploading CSV");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);

    try {
      const res = await fetch("/api/admin/questions/csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CSV upload failed");

      setSuccess(`Uploaded ${data.count} questions from CSV`);
      e.target.value = "";
    } catch (err: any) {
      setError(err.message || "Unable to complete this action. Please try again.");
      e.target.value = "";
    }
  };

  const isMasterRoleSet = questions.length > 0 && questions[0].role !== "";
  const masterRole = questions[0]?.role || "";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Management</h1>
          <p className="text-gray-500">Create assessments, review results, and monitor learner performance across all courses.</p>
        </div>
        <button
          onClick={() => router.push("/admin/assessment/report")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <BarChart3 className="w-4 h-4" />
          Assessment Report
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Save className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Category Select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.skillLevel}) — {cat.examTimeLimit}min / {cat.passThreshold}% pass
            </option>
          ))}
        </select>
      </div>

      {/* Category Info Card */}
      {selectedCategory && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {selectedCategory.name}
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {selectedCategory.skillLevel}
            </span>
          </div>
          <p className="text-sm text-indigo-600 mb-2">{selectedCategory.description}</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategory.roles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 text-xs rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Master Role Indicator */}
      {isMasterRoleSet && questions.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            All questions locked to sub-role: <strong>{masterRole}</strong>. Change Question 1's role to update all.
          </p>
        </div>
      )}

      {/* CSV Upload */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
        <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">Upload CSV with questions</p>
        <p className="text-xs text-gray-400 mb-3">
          Columns: question, option1, option2, option3, option4, correctAnswer, explanation, difficulty, isFinalStage, role
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer inline-block hover:bg-indigo-700 text-sm font-medium"
        >
          Choose CSV File
        </label>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const isFirst = qIndex === 0;
          const isLocked = !isFirst && isMasterRoleSet;

          return (
            <div key={qIndex} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                  {isLocked && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter question text..."
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-3 mb-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Explanation (shown after answering)"
                value={q.explanation}
                onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />

              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={q.difficulty}
                  onChange={(e) => updateQuestion(qIndex, "difficulty", parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                  <option value={4}>Very Hard</option>
                  <option value={5}>Expert</option>
                </select>

                {selectedCategory && selectedCategory.roles.length > 0 && (
                  <div className="relative">
                    <select
                      value={q.role}
                      onChange={(e) => updateQuestion(qIndex, "role", e.target.value)}
                      disabled={isLocked}
                      className={`px-3 py-2 border rounded-lg text-sm min-w-[180px] ${
                        isLocked
                          ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                          : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      }`}
                    >
                      <option value="">Select sub-role</option>
                      {selectedCategory.roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    {isLocked && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={q.isFinalStage}
                    onChange={(e) => updateQuestion(qIndex, "isFinalStage", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  Final Stage
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={addQuestion}
          disabled={!selectedCategory}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || questions.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {uploading ? "Uploading..." : `Upload ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}