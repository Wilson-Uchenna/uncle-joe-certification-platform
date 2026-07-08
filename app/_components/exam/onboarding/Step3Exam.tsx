"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category, ExamStartResponse, ExamSubmitResponse } from "@/types/exam";
import { ExamHeader } from "./ExamHeader";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigator } from "./QuestionNavigator";
import { ExamStats } from "./ExamStats";
import { SubmitModal } from "./SubmitModal";

interface Step3ExamProps {
  category: Category;
  selectedRole: string;
  onSubmit: (result: ExamSubmitResponse) => void;
}

export function Step3Exam({ category, selectedRole, onSubmit }: Step3ExamProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exam data from API
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState<ExamStartResponse["questions"]>([]);
  const [timeLimit, setTimeLimit] = useState(0);

  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // ===== START EXAM =====
  useEffect(() => {
    startExam();
  }, []);

  const startExam = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryId: category._id,
          selectedRole,
          isFinalStage: false, // TODO: determine if final stage based on user progress
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error === "You have an ongoing exam") {
          // Resume existing exam
          // TODO: Fetch existing exam state from API
          setError("You have an ongoing exam. Please resume from your dashboard.");
          return;
        }
        throw new Error(data.error || "Failed to start exam");
      }

      setExamId(data.examId);
      setQuestions(data.questions);
      setTimeLimit(data.timeLimit);
      setTimeRemaining(data.timeLimit * 60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== TIMER =====
  useEffect(() => {
    if (loading || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeRemaining]);

  // ===== AUTO-SAVE =====
  useEffect(() => {
    if (loading || !examId) return;
    const autoSave = setInterval(() => {
      saveAnswer(currentQuestion, false);
    }, 30000);
    return () => clearInterval(autoSave);
  }, [currentQuestion, answers, examId, loading]);

  // ===== PREVENT NAVIGATION =====
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ===== SAVE ANSWER =====
  const saveAnswer = async (questionIndex: number, showLoading = true) => {
    if (!examId || answers[questionIndex] === undefined) return;

    if (showLoading) setSaving(true);
    try {
      await fetch("/api/exam/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId,
          questionIndex,
          answerIndex: answers[questionIndex],
          timeSpent: 0, // TODO: track per-question time
        }),
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      if (showLoading) setSaving(false);
    }
  };

  // ===== SELECT ANSWER =====
  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const updated = { ...prev, [currentQuestion]: optionIndex };
      return updated;
    });
    // Auto-save immediately on selection
    setTimeout(() => saveAnswer(currentQuestion, false), 100);
  };

  // ===== TOGGLE FLAG =====
  const toggleFlag = () => {
    setFlagged((prev) => {
      const isFlagged = prev.includes(currentQuestion);
      return isFlagged
        ? prev.filter((i) => i !== currentQuestion)
        : [...prev, currentQuestion];
    });
  };

  // ===== NAVIGATION =====
  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (isTimeout = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId,
          isTimeout,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit exam");
      }

      onSubmit(data);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmit();
    }
  };

  // ===== RENDER STATES =====
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Starting your exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="animate-fadeIn">
      <ExamHeader
        category={category}
        selectedRole={selectedRole}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        timeRemaining={timeRemaining}
        saving={saving}
      />

      <QuestionCard
        question={currentQ}
        selectedOptionIndex={answers[currentQuestion]}
        isFlagged={flagged.includes(currentQuestion)}
        onSelectOption={selectAnswer}
        onToggleFlag={toggleFlag}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={goNext}
          disabled={currentQuestion === totalQuestions - 1}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <QuestionNavigator
        totalQuestions={totalQuestions}
        currentIndex={currentQuestion}
        answers={answers}
        flagged={flagged}
        onNavigate={goToQuestion}
      />

      <ExamStats
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flagged.length}
        onSubmit={handleSubmitClick}
        submitting={submitting}
      />

      {showSubmitConfirm && (
        <SubmitModal
          unansweredCount={totalQuestions - answeredCount}
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={() => {
            setShowSubmitConfirm(false);
            handleSubmit();
          }}
        />
      )}
    </div>
  );
}