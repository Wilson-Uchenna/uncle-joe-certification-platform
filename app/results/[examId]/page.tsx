"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  Briefcase,
  Download,
  Share2,
  ArrowRight,
  RotateCcw,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";
import {
  ResultData,
  getPerformanceLevel,
  getScoreLabel,
} from "@/types/results";
import { ResultsCountdown } from "@/app/_components/results/ResultCountdown";
import PaystackButton from "@/app/_components/payments/PaymentsButton";
import { authClient } from "@/lib/auth-client";

function PaymentRequired({
  examId,
  onUnlocked,
}: {
  examId: string;
  onUnlocked: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<
    "idle" | "initializing" | "ready" | "processing" | "error"
  >("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [examData, setExamData] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [loadingExam, setLoadingExam] = useState(true);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({
    msg: "",
    show: false,
  });

  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  async function fetchSession() {
    const session = await authClient.getSession();
    return session;
  }

  useEffect(() => {
    authClient
      .getSession()
      .then((s) => setEmail(s?.data?.user?.email ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const res = await fetch(`/api/result/${examId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setExamData(data.result);
        if (data.result.certificatePaidAt) {
          setPaid(true);
        }
      }
    } catch (err) {
    } finally {
      setLoadingExam(false);
    }
  };

  const startPayment = async () => {
    if (!examData) {
      showToast("Still loading your result — try again in a moment.");
      return;
    }
    setModalOpen(true);
    setStage("initializing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId: examData.examId,
          amount: 5000,
          email,
          type: "results",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Could not start payment");
        return;
      }
      setReference(data.reference);
      setStage("ready");
    } catch {
      showToast("Could not start payment. Please try again.");
      setStage("error");
    }
  };

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, show: true });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      3200,
    );
  }, []);

  const handleSuccess = async (ref: string) => {
    setStage("processing");
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reference: ref }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Verification failed");
      setModalOpen(false);
      onUnlocked(); // parent re-fetches the result, paymentRequired flips false
    } catch (err: any) {
      setErrorMsg(err.message || "Payment failed. Please try again.");
      setStage("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center px-5">
      <div className="text-center max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6 border-2 border-violet-100">
          <Lock className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1e1b4b] mb-2">
          Unlock Your Full Results
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Your results are ready. Pay ₦5,000 to view your detailed breakdown
          {/* if passed, mention cert; you don't know pass/fail yet client-side though — see note below */}
          .
        </p>
        <button
          onClick={startPayment}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          Unlock Results — ₦5,000
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            {stage === "initializing" && (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
            )}
            {stage === "ready" && reference && email && (
              <PaystackButton
                email={email}
                amount={5000}
                reference={reference}
                metadata={{ examId, type: "results" }}
                onSuccess={handleSuccess}
                onCancel={() => setModalOpen(false)}
                className="w-full bg-violet-600 text-white font-bold h-12 rounded-xl"
              >
                Pay ₦5,000 with Paystack
              </PaystackButton>
            )}
            {stage === "processing" && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-600" />
                <p className="text-sm text-slate-500">Verifying payment…</p>
              </>
            )}
            {stage === "error" && (
              <>
                <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
                <button
                  onClick={startPayment}
                  className="text-sm font-bold text-violet-700"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [embargoLifted, setEmbargoLifted] = useState(true);
  const [paymentRequired, setPaymentRequired] = useState(false);

  useEffect(() => {
    if (!examId) return;
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/result/${examId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch results");
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Result not found");
      }

      const resultData: ResultData = data.result;
      console.log("Fetched result data:", resultData);

      // NEW: Check embargo
      const now = new Date().getTime();
      const availableAt = new Date(resultData.resultsAvailableAt).getTime();

      if (now < availableAt) {
        setResult(resultData);
        setEmbargoLifted(false);
        setLoading(false);
        return;
      }

      // Embargo has lifted — now check payment
      if (!resultData.resultsPaidAt) {
        setResult(resultData);
        setEmbargoLifted(true);
        setPaymentRequired(true);
        setLoading(false);
        return;
      }

      setResult(resultData);
      setPaymentRequired(false); // NEW — explicitly clear the paywall once paid
      setEmbargoLifted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = !!result?.certificatePaidAt;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!embargoLifted && result?.resultsAvailableAt) {
    return (
      <ResultsCountdown
        availableAt={result.resultsAvailableAt}
        onAvailable={fetchResult}
      />
    );
  }

  if (paymentRequired && result) {
    return <PaymentRequired examId={examId} onUnlocked={fetchResult} />;
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-sm">
            {error || "Result not found"}
          </p>
          <button
            onClick={fetchResult}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const level = getPerformanceLevel(result.score, result.passed);
  const scoreLabel = getScoreLabel(result.score);

  return (
    <div className="min-h-screen bg-[#f8f7fb]">
      <div className="max-w-[700px] mx-auto py-8 px-5">
        <ScoreHero result={result} scoreLabel={scoreLabel} />
        <PerformanceMessage level={level} />
        <ScoreBreakdown result={result} />
        <PerformanceInsights />
        {result.categoryRank && <Rankings result={result} />}
        <QualificationCTA result={result} />
        <FinalMessage />
        <ActionButtons result={result} />
      </div>
    </div>
  );
}

function ScoreHero({
  result,
  scoreLabel,
}: {
  result: ResultData;
  scoreLabel: string;
}) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">
        Your Results Are In!
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Congratulations on completing your assessment!
      </p>

      <div className="relative rounded-[24px] p-8 border-2 bg-violet-50 border-violet-200 mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/30" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/20" />

        <div className="relative z-10">
          <div className="mx-auto mb-4 w-32 h-32 rounded-full bg-white shadow-lg flex flex-col items-center justify-center border-4 border-white">
            <span className="text-4xl font-bold bg-gradient-to-br from-violet-700 to-violet-900 bg-clip-text text-transparent">
              {result.score}%
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-1">
              {scoreLabel}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-violet-700 shadow-sm">
              {result.categoryName}
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm">
              {result.correctCount}/{result.totalQuestions} correct
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            {result.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm font-bold ${result.passed ? "text-emerald-600" : "text-red-600"}`}
            >
              {result.passed ? "Passed" : "Did Not Pass"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceMessage({ level }: { level: string }) {
  const messages: Record<
    string,
    { icon: string; title: string; body: string; color: string }
  > = {
    outstanding: {
      icon: "🏆",
      title: "Exceptional Work!",
      body: "Congratulations! You delivered an outstanding performance and demonstrated an excellent understanding of the course content. Your hard work and consistency have truly paid off. You're now one step closer to achieving your career goals.",
      color: "emerald",
    },
    passed: {
      icon: "🎉",
      title: "Congratulations! You Passed!",
      body: "You've successfully met the assessment requirements. You've demonstrated the knowledge and practical skills needed to move forward. Keep learning, keep growing, and continue building your future.",
      color: "violet",
    },
    good_attempt: {
      icon: "💪",
      title: "Great Effort!",
      body: "You've completed your assessment successfully. While there's always room to grow, you've made meaningful progress on your learning journey. Keep building your skills and aiming higher.",
      color: "amber",
    },
    needs_improvement: {
      icon: "🌱",
      title: "Keep Going — You're Closer Than You Think",
      body: "Don't be discouraged. Every expert started as a beginner, and every challenge is an opportunity to improve. Review the learning materials, strengthen your understanding, and come back stronger. We're cheering you on every step of the way.",
      color: "red",
    },
    completed: {
      icon: "✅",
      title: "Assessment Successfully Submitted",
      body: "Thank you for completing your assessment. Your performance has been recorded successfully. Check your dashboard to view your detailed results and recommended next steps.",
      color: "slate",
    },
  };

  const msg = messages[level] || messages.completed;
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    slate: "bg-slate-50 border-slate-200 text-slate-800",
  };

  return (
    <div className={`rounded-2xl p-6 border mb-6 ${colorMap[msg.color]}`}>
      <div className="text-3xl mb-3">{msg.icon}</div>
      <h2 className="text-lg font-bold mb-2">{msg.title}</h2>
      <p className="text-sm leading-relaxed opacity-90">{msg.body}</p>
    </div>
  );
}

function ScoreBreakdown({ result }: { result: ResultData }) {
  const scoreLabel = getScoreLabel(result.score);
  const explanations: Record<string, { title: string; body: string }> = {
    Excellent: {
      title: "Excellent Performance",
      body: "You demonstrated a strong understanding of the course objectives. You're well prepared to move on to certification and career opportunities. Keep up the fantastic work!",
    },
    "Very Good": {
      title: "Very Good Performance",
      body: "You have a solid understanding of the course content. Continue developing your skills and applying what you've learned.",
    },
    Good: {
      title: "Good Progress",
      body: "You've shown a good understanding of the material. Review the areas where you lost marks and continue learning to strengthen your expertise.",
    },
    Fair: {
      title: "A Great Opportunity to Improve",
      body: "You're making progress. Spend some time revisiting key lessons before moving on. Growth comes from continuous learning.",
    },
    "Below Passing": {
      title: "Don't Give Up",
      body: "This result doesn't define your potential. Review your course materials, practice consistently, and try again when you're ready. Every successful professional has faced challenges and every challenge is a chance to grow.",
    },
  };
  const exp = explanations[scoreLabel] || explanations.Fair;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Score Breakdown
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{scoreLabel}</span>
            <span className="font-bold text-slate-900">{result.score}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                result.score >= 90
                  ? "bg-emerald-500"
                  : result.passed
                    ? "bg-violet-500"
                    : result.score >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 mb-1">{exp.title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{exp.body}</p>
      </div>
      {result.breakdown?.length > 0 && (
        <div className="mt-4 space-y-3">
          {result.breakdown.map((item) => (
            <div key={item.category}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{item.category}</span>
                <span className="font-medium text-slate-700">
                  {item.correct}/{item.total} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerformanceInsights() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Performance Insights
      </h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-0.5">
              Strengths
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              You performed well in several areas of the assessment. Keep
              building on these strengths as you continue your learning journey.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-0.5">
              Areas for Improvement
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Learning never stops. Review the recommended lessons, revisit
              challenging topics, and continue practicing to improve your
              understanding.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-0.5">
              Personalized Recommendation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your performance, we recommend exploring additional
              practice materials and completing the suggested learning modules
              before attempting another assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rankings({ result }: { result: ResultData }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Your Rankings
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {result.categoryRank && (
          <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
            <Trophy className="w-6 h-6 text-violet-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-violet-700">
              #{result.categoryRank}
            </div>
            <div className="text-[10px] text-violet-600 font-medium uppercase tracking-wide">
              Category
            </div>
          </div>
        )}
        {result.overallRank && (
          <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <Star className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">
              #{result.overallRank}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">
              Overall
            </div>
          </div>
        )}
        {result.stateRank && (
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-700">
              #{result.stateRank}
            </div>
            <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wide">
              State
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QualificationCTA({ result }: { result: ResultData }) {
  if (result.passed && result.certificateAvailable) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white text-center mb-6">
        <Award className="w-10 h-10 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
        <p className="text-sm text-white/85 leading-relaxed mb-4">
          You've successfully met all the requirements to earn your Skillora
          Certification. Your certificate is now being prepared and will be
          available in your dashboard shortly.
        </p>
        <Link
          href={`/certificates/view/?examId=${result.examId}&score=${result.score}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          View My Certificate
        </Link>
      </div>
    );
  }
  if (result.passed) {
    return (
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 text-white text-center mb-6">
        <Briefcase className="w-10 h-10 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">
          Career Opportunities Unlocked!
        </h3>
        <p className="text-sm text-white/85 leading-relaxed mb-4">
          Fantastic! Your successful performance has unlocked access to
          internship and remote job opportunities that match your skills.
          Explore opportunities and begin applying today.
        </p>
        <Link
          href="/career-opportunities"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-violet-700 text-sm font-bold rounded-lg hover:bg-violet-50 transition-colors"
        >
          <Briefcase className="w-4 h-4" />
          Explore Opportunities
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center mb-6">
      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        Additional Requirements Needed
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        You're almost there! Complete the remaining course requirements to
        unlock your certification and career opportunities. Keep going — you've
        got this!
      </p>
      <Link
        href="/my-learning"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        Continue Learning
      </Link>
    </div>
  );
}

function FinalMessage() {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 text-center mb-6">
      <Sparkles className="w-8 h-8 text-violet-500 mx-auto mb-3" />
      <p className="text-sm text-violet-800 leading-relaxed font-medium">
        Every result tells a story — not just of what you've achieved, but of
        the effort, resilience, and determination you've shown along the way.
        Whether you've passed with distinction or discovered areas to improve,
        remember that learning is a journey of continuous growth. Celebrate your
        achievements, learn from every experience, and keep moving forward. Your
        future is built one skill, one assessment, and one achievement at a
        time.
      </p>
    </div>
  );
}

function ActionButtons({ result }: { result: ResultData }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
        }}
      >
        <ArrowRight className="w-4 h-4" />
        Continue My Career Journey
      </Link>
      {result.shareUrl && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(result.shareUrl!);
            alert("Link copied!");
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Results
        </button>
      )}
      <Link
        href="/exam"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Retake Exam
      </Link>
    </div>
  );
}
