"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Award,
  Download,
  
  FileText,
  Briefcase,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Globe,
  MapPin,
  ChevronRight,
  Star,
  PartyPopper,
  Rocket,
  Heart,
  Eye,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface FinalStageData {
  userName: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  certificateUrl?: string;
  careerProfileComplete: boolean;
}

// ─── Mock Data (replace with API fetch) ────────────────────────────

const useFinalStageData = () => {
  const [data, setData] = useState<FinalStageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData({
        userName: "Alex Johnson",
        categoryName: "Full-Stack Development",
        skillLevel: "Advanced",
        score: 94,
        certificateUrl: "/certificates/skillora-cert.pdf",
        careerProfileComplete: false,
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
};

// ─── Main Page ─────────────────────────────────────────────────────

export default function FinalStagePage() {
  const { data, loading } = useFinalStageData();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (loading) return <LoadingScreen />;
  if (!data) return <ErrorScreen />;

  const steps = [
    { id: 0, label: "Celebration" },
    { id: 1, label: "Certificate" },
    { id: 2, label: "Next Steps" },
    { id: 3, label: "Opportunities" },
    { id: 4, label: "Thank You" },
  ];

  const markStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-[#f8f7fb]">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
              Final Stage
            </span>
            <span className="text-xs text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="flex gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  idx === currentStep
                    ? "bg-violet-600"
                    : idx < currentStep || completedSteps.has(step.id)
                    ? "bg-violet-300"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8">
        {currentStep === 0 && (
          <CelebrationStep
            data={data}
            onComplete={() => markStepComplete(0)}
            onNext={() => goToStep(1)}
          />
        )}
        {currentStep === 1 && (
          <CertificateStep
            data={data}
            onComplete={() => markStepComplete(1)}
            onNext={() => goToStep(2)}
            onBack={() => goToStep(0)}
          />
        )}
        {currentStep === 2 && (
          <NextStepsStep
            onComplete={() => markStepComplete(2)}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}
        {currentStep === 3 && (
          <OpportunitiesStep
            data={data}
            onComplete={() => markStepComplete(3)}
            onNext={() => goToStep(4)}
            onBack={() => goToStep(2)}
          />
        )}
        {currentStep === 4 && (
          <ThankYouStep
            onComplete={() => markStepComplete(4)}
            onRestart={() => goToStep(0)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Celebration ───────────────────────────────────────────

function CelebrationStep({
  data,
  onComplete,
  onNext,
}: {
  data: FinalStageData;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    onComplete();
    return () => clearTimeout(timer);
  }, [onComplete]);

  const messages = [
    {
      icon: Trophy,
      title: "Congratulations!",
      body: `You've successfully completed your Skillora learning journey. Your commitment, consistency, and determination have led you to this incredible achievement. Celebrate your success — you've earned it!`,
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    {
      icon: Star,
      title: "Well Done!",
      body: `Every lesson you completed, every assessment you passed, and every challenge you overcame has prepared you for greater opportunities. The future belongs to those who keep learning, and today you've proven you're ready.`,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-800",
    },
    {
      icon: Briefcase,
      title: "You're Career Ready",
      body: `You've developed practical skills that employers value. Now it's time to put those skills into action through internships, remote jobs, and exciting career opportunities. We're proud of everything you've achieved.`,
      gradient: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
    },
    {
      icon: Rocket,
      title: "A New Chapter Begins",
      body: `This certificate isn't the finish line. It's your passport to new experiences, greater confidence, and bigger career possibilities. Keep moving forward.`,
      gradient: "from-rose-400 to-pink-500",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 mb-6 shadow-lg shadow-violet-200 transition-all duration-700 ${
            showConfetti ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <PartyPopper className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#1e1b4b] mb-3">
          Congratulations! You've Reached the Finish Line.
        </h1>
        <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          You've completed your learning journey, earned valuable skills, and
          taken an important step toward building a successful career. Today
          marks the beginning of exciting new opportunities.
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full text-sm font-semibold text-violet-700 mb-4">
          <Sparkles className="w-4 h-4" />
          Final Assessment Complete
        </div>
        <div className="flex items-center justify-center gap-8">
          <div>
            <div className="text-4xl font-bold text-violet-700">{data.score}%</div>
            <div className="text-xs text-slate-500 mt-1">Final Score</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div>
            <div className="text-lg font-bold text-slate-800">{data.categoryName}</div>
            <div className="text-xs text-slate-500 mt-1">{data.skillLevel}</div>
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid gap-4 mb-8">
        {messages.map((msg, idx) => (
          <div
            key={msg.title}
            className={`${msg.bg} rounded-2xl p-5 border ${msg.border} transition-all duration-500 hover:shadow-md`}
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="flex gap-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${msg.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <msg.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${msg.text} mb-1`}>
                  {msg.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {msg.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          Claim Your Certificate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Certificate ───────────────────────────────────────────

function CertificateStep({
  data,
  onComplete,
  onNext,
  onBack,
}: {
  data: FinalStageData;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [linkedInAdded, setLinkedInAdded] = useState(false);
  const [savedPortfolio, setSavedPortfolio] = useState(false);

  const allDone = downloaded && linkedInAdded && savedPortfolio;

  useEffect(() => {
    if (allDone) onComplete();
  }, [allDone, onComplete]);

  const actions = [
    {
      id: "download",
      icon: Download,
      title: "Download Certificate",
      desc: "Save your official Skillora certificate as a PDF.",
      done: downloaded,
      onClick: () => {
        // window.open(data.certificateUrl, "_blank");
        setDownloaded(true);
      },
      color: "violet",
    },
    {
      id: "linkedin",
      icon: Eye,
      title: "Add to LinkedIn",
      desc: "Share your certification on your LinkedIn profile.",
      done: linkedInAdded,
      onClick: () => setLinkedInAdded(true),
      color: "blue",
    },
    {
      id: "portfolio",
      icon: FileText,
      title: "Save to Portfolio",
      desc: "Update your CV or professional portfolio.",
      done: savedPortfolio,
      onClick: () => setSavedPortfolio(true),
      color: "emerald",
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e1b4b] mb-2">
          🏅 Your Certificate is Ready
        </h2>
        <p className="text-sm text-slate-600">
          Complete these steps to make the most of your achievement.
        </p>
      </div>

      {/* Certificate Preview Card */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-8 text-white text-center mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <Award className="w-12 h-12 mx-auto mb-4 text-amber-300" />
          <h3 className="text-xl font-bold mb-1">Skillora Certification</h3>
          <p className="text-sm text-white/80 mb-4">{data.categoryName}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Officially Awarded
          </div>
        </div>
      </div>

      {/* Action Checklist */}
      <div className="space-y-3 mb-8">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              action.done
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                action.done
                  ? "bg-emerald-100"
                  : "bg-slate-100"
              }`}
            >
              {action.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <action.icon
                  className={`w-5 h-5 ${
                    action.color === "violet"
                      ? "text-violet-600"
                      : action.color === "blue"
                      ? "text-blue-600"
                      : "text-emerald-600"
                  }`}
                />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`text-sm font-bold ${
                  action.done ? "text-emerald-800" : "text-slate-800"
                }`}
              >
                {action.title}
              </h4>
              <p className="text-xs text-slate-500">{action.desc}</p>
            </div>
            {action.done && (
              <span className="text-xs font-semibold text-emerald-600">
                Done
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Completion</span>
          <span className="font-bold text-violet-700">
            {[downloaded, linkedInAdded, savedPortfolio].filter(Boolean).length}/3
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{
              width: `${
                ([downloaded, linkedInAdded, savedPortfolio].filter(Boolean)
                  .length /
                  3) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!allDone}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all ${
            allDone
              ? "hover:-translate-y-0.5 hover:shadow-lg"
              : "opacity-50 cursor-not-allowed"
          }`}
          style={{
            background: allDone
              ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
              : "#a5a5a5",
            boxShadow: allDone
              ? "0 4px 15px rgba(124, 58, 237, 0.3)"
              : "none",
          }}
        >
          Continue to Next Steps
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Final Steps Checklist ─────────────────────────────────

function NextStepsStep({
  onComplete,
  onNext,
  onBack,
}: {
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const steps = [
    {
      id: "download",
      icon: Download,
      label: "Download your Skillora Certificate",
      desc: "Keep a copy for your records",
    },
    {
      id: "portfolio",
      icon: FileText,
      label: "Save your certificate to your professional portfolio",
      desc: "Showcase your achievement",
    },
    {
      id: "cv",
      icon: Briefcase,
      label: "Update your CV or résumé",
      desc: "Add your new certification",
    },
    {
      id: "linkedin",
      icon: Eye,
      label: "Add your certification to LinkedIn",
      desc: "Let your network know",
    },
    {
      id: "profile",
      icon: GraduationCap,
      label: "Complete your Career Profile",
      desc: "Help employers find you",
    },
    {
      id: "internship",
      icon: MapPin,
      label: "Explore internship opportunities",
      desc: "Gain real-world experience",
    },
    {
      id: "remote",
      icon: Globe,
      label: "Browse available remote jobs",
      desc: "Work from anywhere",
    },
    {
      id: "learn",
      icon: BookOpen,
      label: "Continue learning with another Skillora course",
      desc: "Never stop growing",
    },
  ];

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = (checked.size / steps.length) * 100;

  useEffect(() => {
    if (checked.size === steps.length) onComplete();
  }, [checked, onComplete, steps.length]);

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e1b4b] mb-2">
          Final Stage Instructions
        </h2>
        <p className="text-sm text-slate-600">
          Before you leave, make sure you've completed these final steps. Your
          journey doesn't end here — it grows from here.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Checklist Progress</span>
          <span className="font-bold text-emerald-600">
            {checked.size}/{steps.length}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-8">
        {steps.map((step) => {
          const isChecked = checked.has(step.id);
          return (
            <button
              key={step.id}
              onClick={() => toggle(step.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                isChecked
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-slate-200 hover:border-violet-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  isChecked
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-slate-300"
                }`}
              >
                {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <h4
                  className={`text-sm font-bold ${
                    isChecked ? "text-emerald-800 line-through" : "text-slate-800"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
              <step.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isChecked ? "text-emerald-400" : "text-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          Explore Opportunities
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Opportunities ─────────────────────────────────────────

function OpportunitiesStep({
  data,
  onComplete,
  onNext,
  onBack,
}: {
  data: FinalStageData;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  const notifications = [
    {
      icon: BookOpen,
      title: "Course Completed",
      message: "Congratulations! You have successfully completed your course.",
      color: "violet",
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-800",
    },
    {
      icon: Trophy,
      title: "Learning Journey Completed",
      message:
        "Fantastic! You've reached another important milestone in your professional development.",
      color: "amber",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    {
      icon: Award,
      title: "Certificate Earned",
      message:
        "🏅 Your Skillora Certification has officially been awarded. Celebrate your achievement!",
      color: "emerald",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
    },
    {
      icon: GraduationCap,
      title: "Career Profile Ready",
      message:
        "Your profile is now ready to connect with employers and recruiters.",
      color: "blue",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
    {
      icon: MapPin,
      title: "Internship Ready",
      message:
        "You're now eligible to apply for internship opportunities available on Skillora.",
      color: "rose",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
    },
    {
      icon: Globe,
      title: "Remote Job Ready",
      message:
        "Great news! You can now explore remote job opportunities that match your skills and certifications.",
      color: "teal",
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-800",
    },
    {
      icon: Sparkles,
      title: "Next Learning Opportunity",
      message:
        "Learning never stops! Discover your next course and continue expanding your skills.",
      color: "purple",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
    },
  ];

  const quickLinks = [
    {
      icon: Briefcase,
      label: "Internships",
      href: "/internships",
      desc: "Apply now",
      color: "from-rose-400 to-pink-500",
    },
    {
      icon: Globe,
      label: "Remote Jobs",
      href: "/remote-jobs",
      desc: "Work anywhere",
      color: "from-teal-400 to-emerald-500",
    },
    {
      icon: BookOpen,
      label: "More Courses",
      href: "/courses",
      desc: "Keep learning",
      color: "from-violet-400 to-purple-500",
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e1b4b] mb-2">
          Your Opportunities Await
        </h2>
        <p className="text-sm text-slate-600">
          Here's everything you've unlocked. Your future starts now.
        </p>
      </div>

      {/* Notifications Grid */}
      <div className="grid gap-3 mb-8">
        {notifications.map((notif) => (
          <div
            key={notif.title}
            className={`${notif.bg} rounded-xl p-4 border ${notif.border} flex gap-4 items-start`}
          >
            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
              <notif.icon className={`w-5 h-5 ${notif.text}`} />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${notif.text} mb-0.5`}>
                {notif.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="bg-white rounded-xl p-4 border border-slate-200 text-center hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
            >
              <link.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-bold text-slate-800 mb-0.5">
              {link.label}
            </div>
            <div className="text-[10px] text-slate-500">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Career Profile CTA */}
      {!data.careerProfileComplete && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-violet-900 mb-1">
                Complete Your Career Profile
              </h3>
              <p className="text-sm text-violet-700/80 mb-3">
                Connect with employers and recruiters looking for your skills.
              </p>
              <Link
                href="/career-profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 transition-colors"
              >
                Set Up Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          Finish
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Thank You ─────────────────────────────────────────────

function ThankYouStep({
  onComplete,
  onRestart,
}: {
  onComplete: () => void;
  onRestart: () => void;
}) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="animate-fadeIn text-center">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#1e1b4b] mb-4">
          Thank You for Choosing Skillora Certification
        </h2>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8 text-left">
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          We're honored to have been part of your learning journey. Whether
          you're taking your first steps into the workforce or advancing your
          professional career, remember that every skill you've gained today
          brings you closer to the future you envision.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          This isn't goodbye — it's the beginning of your next chapter. We'll
          continue supporting you with new courses, certifications, internships,
          and career opportunities whenever you're ready.
        </p>
        <div className="text-center py-4">
          <p className="text-lg font-bold text-violet-800 mb-1">
            Keep learning.
          </p>
          <p className="text-lg font-bold text-violet-800 mb-1">
            Keep growing.
          </p>
          <p className="text-lg font-bold text-violet-800">Keep achieving.</p>
          <p className="text-sm text-slate-500 mt-2">
            The best is yet to come.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Explore Your Next Opportunity
        </Link>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-violet-700 bg-violet-50 rounded-xl border border-violet-200 hover:bg-violet-100 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Browse More Courses
        </Link>
      </div>

      <button
        onClick={onRestart}
        className="text-sm text-slate-500 hover:text-violet-600 transition-colors"
      >
        Replay Final Stage
      </button>
    </div>
  );
}

// ─── Loading & Error Screens ───────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading your achievements...</p>
      </div>
    </div>
  );
}

function ErrorScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4 text-sm">
          Unable to load your final stage data.
        </p>
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