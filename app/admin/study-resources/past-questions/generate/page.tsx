// app/admin/study-resources/past-questions/generate/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ResultRow {
  categoryName: string;
  skillLevel: string;
  status: "generated" | "skipped_no_questions" | "failed";
  questionCount?: number;
  error?: string;
}

interface CategoryOption {
  _id: string;
  name: string;
}

const SKILL_LEVELS = ["entry", "mid", "advanced"] as const;

export default function GeneratePastQuestionsPage() {
  const [mode, setMode] = useState<"one" | "all">("one");

  // Single-generate state
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [skillLevel, setSkillLevel] =
    useState<(typeof SKILL_LEVELS)[number]>("entry");
  const [singleRunning, setSingleRunning] = useState(false);
  const [singleResult, setSingleResult] = useState<{
    questionCount: number;
  } | null>(null);
  const [singleError, setSingleError] = useState("");

  // Generate-all state
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [summary, setSummary] = useState<{
    generated: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  async function handleGenerateOne() {
    if (!categoryId) {
      setSingleError("Select a category first.");
      return;
    }
    setSingleRunning(true);
    setSingleError("");
    setSingleResult(null);
    try {
      const res = await fetch(
        "/api/admin/study-resources/past-questions/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId, skillLevel }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSingleResult(data);
    } catch (err: any) {
      setSingleError(err.message || "Something went wrong");
    } finally {
      setSingleRunning(false);
    }
  }

  async function handleGenerateAll() {
    setRunning(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(
        "/api/admin/study-resources/past-questions/generate-all",
        {
          method: "POST",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResults(data.results);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Generate past-question PDFs
      </h1>
      <p className="text-gray-500 mb-6">
        Builds a PDF from the current question bank for a category and skill
        level. Regenerating a combo replaces its existing PDF rather than
        duplicating it.
      </p>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setMode("one")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            mode === "one"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Generate one
        </button>
        <button
          onClick={() => setMode("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            mode === "all"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Generate all
        </button>
      </div>

      {mode === "one" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Skill level
            </label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                    skillLevel === level
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateOne}
            disabled={singleRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
          >
            {singleRunning && <Loader2 className="w-4 h-4 animate-spin" />}
            {singleRunning ? "Generating…" : "Generate"}
          </button>

          {singleError && <p className="text-sm text-red-600">{singleError}</p>}
          {singleResult && (
            <p className="text-sm text-green-700">
              Generated with {singleResult.questionCount} questions.
            </p>
          )}
        </div>
      )}

      {mode === "all" && (
        <div>
          <button
            onClick={handleGenerateAll}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
          >
            {running && <Loader2 className="w-4 h-4 animate-spin" />}
            {running ? "Generating…" : "Generate all"}
          </button>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          {summary && (
            <p className="text-sm text-gray-600 mt-6">
              {summary.generated} generated, {summary.skipped} skipped (no
              questions), {summary.failed} failed.
            </p>
          )}

          {results && (
            <table className="w-full mt-4 text-sm border-collapse">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Category</th>
                  <th className="py-2">Level</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">{r.categoryName}</td>
                    <td className="py-2 capitalize">{r.skillLevel}</td>
                    <td className="py-2">
                      {r.status === "generated" && (
                        <span className="text-green-700">
                          Generated ({r.questionCount} questions)
                        </span>
                      )}
                      {r.status === "skipped_no_questions" && (
                        <span className="text-gray-400">No questions</span>
                      )}
                      {r.status === "failed" && (
                        <span className="text-red-600">{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
