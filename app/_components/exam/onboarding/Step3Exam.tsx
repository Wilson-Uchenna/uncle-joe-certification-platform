"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Category, ExamStartResponse, ExamSubmitResponse } from "@/types/exam";
import { ExamHeader } from "./ExamHeader";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigator } from "./QuestionNavigator";
import { ExamStats } from "./ExamStats";
import { SubmitModal } from "./SubmitModal";

interface Step3ExamProps {
  category: Category;
  selectedRole: string;
  skillLevel: "entry" | "mid" | "advanced";
  onSubmit: (result: ExamSubmitResponse) => void;
}

export function Step3Exam({
  category,
  selectedRole,
  skillLevel,
  onSubmit,
}: Step3ExamProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [showWarning, setShowWarning] = useState(true); // ← Warning before exam

  // Exam data
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState<ExamStartResponse["questions"]>(
    [],
  );
  const [timeLimit, setTimeLimit] = useState(0);

  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const isSubmittingRef = useRef(false);
  const examStartedRef = useRef(false);

  // ===== START EXAM =====
  useEffect(() => {
    startExam();
  }, []);

  const isMountedRef = useRef(true);
const examFinishedRef = useRef(false);

useEffect(() => {
  isMountedRef.current = true;
  examFinishedRef.current = false;

  return () => {
    isMountedRef.current = false;
    
    // If exam wasn't submitted normally, mark as abandoned
    if (!examFinishedRef.current && examId) {
      fetch("/api/exam/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ examId }),
        // keepalive ensures the request fires even during page unload
        keepalive: true,
      }).catch(() => {});
    }
  };
}, [examId]);

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
          skillLevel,
          isFinalStage: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 && data.error === "You have an ongoing exam") {
          setError(
            "You have an ongoing exam. Please resume from your dashboard.",
          );
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

  // ===== ANTI-CHEAT: Zero tolerance =====
  useEffect(() => {
    if (showWarning || !examId) return; // Only activate after warning dismissed

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatingDetected(true);
        handleSubmit(false, "tab_switch");
      }
    };

    const handleBlur = () => {
      setCheatingDetected(true);
      handleSubmit(false, "window_blur");
    };

    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.metaKey && e.altKey && e.key === "i") ||
        (e.ctrlKey && e.key === "u") ||
        (e.altKey && e.key === "Tab") ||
        (e.metaKey && e.key === "Tab")
      ) {
        e.preventDefault();
        setCheatingDetected(true);
        handleSubmit(false, "shortcut_blocked");
        return false;
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const blockClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePopState = () => {
      setCheatingDetected(true);
      handleSubmit(false, "navigation");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    window.addEventListener("popstate", handlePopState);
    history.pushState(null, "", window.location.href);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showWarning, examId]);

  // ===== TIMER =====
  useEffect(() => {
    if (loading || timeRemaining <= 0 || cheatingDetected || showWarning)
      return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeRemaining, cheatingDetected, showWarning]);

  // ===== AUTO-SAVE =====
  useEffect(() => {
  if (loading || !examId || cheatingDetected || showWarning) return;
  
  const autoSave = setInterval(() => {
    const currentAnswer = answers[currentQuestion];
    if (currentAnswer !== undefined) {
      saveAnswerDirect(currentQuestion, currentAnswer, false);
    }
  }, 30000);
  
  return () => clearInterval(autoSave);
}, [
  currentQuestion,
  answers,
  examId,
  loading,
  cheatingDetected,
  showWarning,
]);

  // ===== PREVENT REFRESH / CLOSE =====
useEffect(() => {
  if (showWarning || !examId) return;

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // This only fires the abandon on actual unload, not on submit
    if (!examFinishedRef.current) {
      fetch("/api/exam/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ examId }),
        keepalive: true,
      }).catch(() => {});
    }
    e.preventDefault();
    e.returnValue = "Leaving will submit your exam.";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [showWarning, examId]);
  // ===== SAVE ANSWER =====
  

  // ===== SELECT ANSWER =====
  const selectAnswer = (optionIndex: number) => {
  if (cheatingDetected || showWarning) return;
  
  // Update state
  setAnswers((prev) => ({ ...prev, [currentQuestion]: optionIndex }));
  
  // Save directly with the value, don't read from stale state
  saveAnswerDirect(currentQuestion, optionIndex);
};

const saveAnswerDirect = async (questionIndex: number, answerIndex: number, showLoading = true) => {
  if (!examId) {
    console.log("saveAnswerDirect: no examId");
    return;
  }

  if (showLoading) setSaving(true);
  try {
    const res = await fetch("/api/exam/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        examId,
        questionIndex,
        answerIndex,
        timeSpent: 0,
      }),
    });

    const data = await res.json();
    console.log("saveAnswerDirect response:", data);
    
    if (!res.ok) {
      console.error("saveAnswerDirect failed:", data.error);
    }
  } catch (err) {
    console.error("saveAnswerDirect error:", err);
  } finally {
    if (showLoading) setSaving(false);
  }
};

  // ===== TOGGLE FLAG =====
  const toggleFlag = () => {
    if (cheatingDetected || showWarning) return;
    setFlagged((prev) => {
      const isFlagged = prev.includes(currentQuestion);
      return isFlagged
        ? prev.filter((i) => i !== currentQuestion)
        : [...prev, currentQuestion];
    });
  };

  // ===== NAVIGATION =====
  const goToQuestion = (index: number) => {
    if (cheatingDetected || showWarning) return;
    setCurrentQuestion(index);
  };

  const goNext = () => {
    if (cheatingDetected || showWarning) return;
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion((p) => p + 1);
  };

  const goPrev = () => {
    if (cheatingDetected || showWarning) return;
    if (currentQuestion > 0) setCurrentQuestion((p) => p - 1);
  };

  // ===== SUBMIT =====
 const handleSubmit = async (isTimeout = false, reason?: string) => {
  if (isSubmittingRef.current) return;
  isSubmittingRef.current = true;
  setSubmitting(true);
  examFinishedRef.current = true; // ← Mark as finished
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId,
          isTimeout,
          cheatingDetected: !!reason,
          cheatingReason: reason || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit exam");
      onSubmit(data);
    } catch (err: any) {
      examFinishedRef.current = false;
    setError(err.message);
    setSubmitting(false);
    isSubmittingRef.current = false;
    }
  };

  const handleSubmitClick = () => {
    if (cheatingDetected || showWarning) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmit();
    }
  };

  // ===== WARNING SCREEN =====
  if (showWarning && !loading) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">
              Exam Integrity Policy
            </h2>
          </div>

          <p className="text-red-700 mb-6 leading-relaxed">
            This exam is strictly monitored. Any attempt to cheat will result in
            immediate termination and a failed grade. By proceeding, you agree
            to the following rules:
          </p>

          <div className="space-y-3 mb-8">
            {[
              "Do NOT switch tabs or windows — even once will end your exam",
              "Do NOT minimize the browser or use Alt+Tab / Cmd+Tab",
              "Do NOT right-click, copy, paste, or use keyboard shortcuts",
              "Do NOT open developer tools (F12, Ctrl+Shift+I, etc.)",
              "Do NOT refresh the page or use the back button",
              "Do NOT leave this page for any reason until submitted",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-800 font-medium">{rule}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-200 mb-6">
            <p className="text-sm text-red-600 font-semibold mb-1">
              Zero Tolerance
            </p>
            <p className="text-sm text-red-500">
              There are no warnings. The first violation will immediately submit
              your exam with a failing score. No appeals.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel & Return
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              I Understand — Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOADING =====
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

  // ===== ERROR =====
  if (error && !cheatingDetected) {
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

  // ===== CHEATING TERMINATED =====
  if (cheatingDetected) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Exam Terminated
          </h2>
          <p className="text-slate-600 mb-4 text-sm">
            Your exam has been submitted due to a violation of exam integrity
            rules. This incident has been recorded.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
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
        skillLevel={skillLevel}
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
