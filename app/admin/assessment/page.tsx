"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  Save,
  FileSpreadsheet,
  AlertCircle,
  BarChart3,
  Lock,
  Code,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Category } from "@/types/exam";

type SkillLevel = "entry" | "mid" | "advanced";
type CodeLanguage = "javascript" | "typescript" | "python" | "sql" | "bash" | "html" | "css" | "json";

type Question = {
  question: string;
  codeSnippet: string | null;
  language: CodeLanguage | null;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillLevel: SkillLevel;
  isFinalStage: boolean;
  role: string;
};

const SKILL_LEVEL_CONFIG: Record<
  SkillLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  entry: {
    label: "Entry Level",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  mid: {
    label: "Mid Level",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  advanced: {
    label: "Advanced",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
];

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
    const cat = categories.find((c) => c._id === id) || null;
    setSelectedCategory(cat);
    setQuestions([]);
  };

  const addQuestion = () => {
    const defaultRole = questions[0]?.role || selectedCategory?.roles[0] || "";
    const defaultSkillLevel = questions[0]?.skillLevel || "entry";
    setQuestions([
      ...questions,
      {
        question: "",
        codeSnippet: null,
        language: null,
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        skillLevel: defaultSkillLevel,
        isFinalStage: false,
        role: defaultRole,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    if (index === 0 && (field === "role" || field === "skillLevel") && value) {
      for (let i = 1; i < updated.length; i++) {
        updated[i][field] = value;
      }
    }

    setQuestions(updated);
  };

  const addCodeSnippet = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex] = {
      ...updated[qIndex],
      codeSnippet: "",
      language: "javascript",
    };
    setQuestions(updated);
  };

  const removeCodeSnippet = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex] = {
      ...updated[qIndex],
      codeSnippet: null,
      language: null,
    };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateQuestions = () => {
    if (!categoryId) return "Select a category";
    if (questions.length === 0) return "Add at least one question";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1}: text is required`;
      if (q.options.some((o) => !o.trim()))
        return `Question ${i + 1}: all options required`;
      if (!q.skillLevel) return `Question ${i + 1}: skill level is required`;
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
      // Strip nulls before sending to API (optional fields become undefined)
      const payload = questions.map((q) => ({
        ...q,
        codeSnippet: q.codeSnippet ?? undefined,
        language: q.language ?? undefined,
      }));

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, questions: payload }),
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

  const firstQuestion = questions[0];
  const isMasterRoleSet = !!firstQuestion?.role;
  const masterRole = firstQuestion?.role ?? "";
  const isMasterSkillLevelSet = !!firstQuestion;
  const masterSkillLevel = firstQuestion?.skillLevel ?? "entry";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Assessment Management
          </h1>
          <p className="text-gray-500">
            Create assessments, review results, and monitor learner performance.
          </p>
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
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Info */}
      {selectedCategory && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {selectedCategory.name}
          </span>
          <p className="text-sm text-indigo-600 mb-2">
            {selectedCategory.description}
          </p>
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

      {/* Master Lock Indicators */}
      {questions.length > 1 && (
        <div className="mb-4 space-y-2">
          {isMasterRoleSet && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                All questions locked to sub-role: <strong>{masterRole}</strong>.
              </p>
            </div>
          )}
          {isMasterSkillLevelSet && (
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-600" />
              <p className="text-sm text-violet-700">
                All questions locked to skill level:{" "}
                <strong>{SKILL_LEVEL_CONFIG[masterSkillLevel].label}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CSV Upload */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
        <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">Upload CSV with questions</p>
        <p className="text-xs text-gray-400 mb-3">
          Columns: question, option1, option2, option3, option4, correctAnswer,
          explanation, skillLevel, isFinalStage, role, codeSnippet, language
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
          const isRoleLocked = !isFirst && isMasterRoleSet;
          const isSkillLevelLocked = !isFirst && isMasterSkillLevelSet;
          const hasCodeSnippet = q.codeSnippet !== null;

          return (
            <div
              key={qIndex}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    Question {qIndex + 1}
                  </h3>
                  {isRoleLocked && (
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

              {/* Question Text */}
              <input
                type="text"
                placeholder="Enter question text..."
                value={q.question}
                onChange={(e) =>
                  updateQuestion(qIndex, "question", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* Code Snippet */}
              {hasCodeSnippet ? (
                <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <select
                        value={q.language || "javascript"}
                        onChange={(e) =>
                          updateQuestion(qIndex, "language", e.target.value as CodeLanguage)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        {CODE_LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeCodeSnippet(qIndex)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <textarea
                    value={q.codeSnippet || ""}
                    onChange={(e) =>
                      updateQuestion(qIndex, "codeSnippet", e.target.value)
                    }
                    placeholder="// Enter code here..."
                    className="w-full px-4 py-3 text-sm font-mono bg-slate-900 text-slate-100 resize-y focus:outline-none"
                    rows={4}
                    spellCheck={false}
                  />
                </div>
              ) : (
                <button
                  onClick={() => addCodeSnippet(qIndex)}
                  className="mb-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  Add Code Snippet
                </button>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() =>
                        updateQuestion(qIndex, "correctAnswer", oIndex)
                      }
                      className="w-4 h-4 text-indigo-600"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <textarea
                placeholder="Explanation (shown after answering)"
                value={q.explanation}
                onChange={(e) =>
                  updateQuestion(qIndex, "explanation", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />

              {/* Meta Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Skill Level */}
                <div className="relative">
                  <select
                    value={q.skillLevel}
                    onChange={(e) =>
                      updateQuestion(qIndex, "skillLevel", e.target.value as SkillLevel)
                    }
                    disabled={isSkillLevelLocked}
                    className={`px-3 py-2 border rounded-lg text-sm min-w-[140px] ${
                      isSkillLevelLocked
                        ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Skill Level</option>
                    {(Object.keys(SKILL_LEVEL_CONFIG) as SkillLevel[]).map((level) => (
                      <option key={level} value={level}>
                        {SKILL_LEVEL_CONFIG[level].label}
                      </option>
                    ))}
                  </select>
                  {isSkillLevelLocked && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                </div>

                {q.skillLevel && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${SKILL_LEVEL_CONFIG[q.skillLevel].bg} ${SKILL_LEVEL_CONFIG[q.skillLevel].color} ${SKILL_LEVEL_CONFIG[q.skillLevel].border}`}
                  >
                    {SKILL_LEVEL_CONFIG[q.skillLevel].label}
                  </span>
                )}

                {/* Role */}
                {selectedCategory && selectedCategory.roles.length > 0 && (
                  <div className="relative">
                    <select
                      value={q.role}
                      onChange={(e) =>
                        updateQuestion(qIndex, "role", e.target.value)
                      }
                      disabled={isRoleLocked}
                      className={`px-3 py-2 border rounded-lg text-sm min-w-[180px] ${
                        isRoleLocked
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
                    {isRoleLocked && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}

                {/* Final Stage */}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={q.isFinalStage}
                    onChange={(e) =>
                      updateQuestion(qIndex, "isFinalStage", e.target.checked)
                    }
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
      <div className="flex gap-4 mt-8 mb-10">
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
          {uploading
            ? "Uploading..."
            : `Upload ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
