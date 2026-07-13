"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Unlock,
  Check,
  CreditCard,
  Landmark,
  Wallet,
  Download,
  ShieldCheck,
  FileCheck,
  BookOpen,
  Mail,
  X,
  Award,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import PaystackButton from "@/app/_components/payments/PaymentsButton";

interface SkilloraCertificatePaymentProps {
  examId: string;
  score: number;
}

// ─── Types ─────────────────────────────────────────────
type ViewState = "eligible" | "almost" | "pending";
type PaymentMethod = "card" | "bank" | "wallet" | "paystack" | null;
type ModalStage = "method" | "processing" | "success";

interface ViewConfig {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  btn: string;
  showChecklist: boolean;
  note: React.ReactNode;
}

// ─── Constants ─────────────────────────────────────────
const VIEWS: Record<ViewState, ViewConfig> = {
  eligible: {
    eyebrow: "Certificate Payment",
    title: (
      <>
        You're almost
        <br />
        there<em className="text-[#4C6EF5]">.</em>
      </>
    ),
    sub: "You've put in the work. Complete your certificate payment to unlock your certificate and training resources.",
    btn: "Proceed to Payment",
    showChecklist: true,
    note: (
      <>
        Applies only <b>where certificate payment is required</b> for your
        track.
      </>
    ),
  },
  almost: {
    eyebrow: "In Progress",
    title: (
      <>
        You're very
        <br />
        close<em className="text-[#4C6EF5]">.</em>
      </>
    ),
    sub: "Finish the remaining course requirements before certificate payment. Keep going — you've got this.",
    btn: "Resume Course",
    showChecklist: false,
    note: <>Certificate payment unlocks once every requirement is complete.</>,
  },
  pending: {
    eyebrow: "Payment Pending",
    title: (
      <>
        Your certificate
        <br />
        is waiting<em className="text-[#4C6EF5]">.</em>
      </>
    ),
    sub: "You're qualified — complete your payment to access your certificate and premium materials.",
    btn: "Complete Payment",
    showChecklist: true,
    note: (
      <>
        Applies only <b>where certificate payment is required</b> for your
        track.
      </>
    ),
  },
};

const STEPS = [
  { num: 1, title: "Proceed", desc: "Tap Proceed to Payment" },
  { num: 2, title: "Choose method", desc: "Pick how you'd like to pay" },
  { num: 3, title: "Pay securely", desc: "Complete checkout" },
  { num: 4, title: "Confirm", desc: "Wait for confirmation" },
  { num: 5, title: "Download", desc: "Get your certificate" },
  { num: 6, title: "Unlock", desc: "Access training materials" },
];

const WHY_PAY = [
  {
    num: "01",
    title: "Processing & verification",
    desc: "Your results are checked and your certificate is prepared for issue.",
  },
  {
    num: "02",
    title: "Secure generation",
    desc: "Your digital certificate is created and signed for you alone.",
  },
  {
    num: "03",
    title: "Lifetime verification",
    desc: "Anyone can confirm your certificate is genuine, any time.",
  },
  {
    num: "04",
    title: "Premium resources",
    desc: "Extra training materials to keep building your skills.",
  },
  {
    num: "05",
    title: "Platform & support",
    desc: "Keeps Skillora improving and learner support running.",
  },
  {
    num: "06",
    title: "You, certified",
    desc: "One payment, one credential you can use anywhere.",
  },
];

const TIMELINE = [
  {
    id: 1,
    icon: Check,
    title: "Payment successful",
    desc: "Confirmed — your certificate is ready.",
  },
  {
    id: 2,
    icon: Award,
    title: "Certificate ready",
    desc: "Generated and ready to showcase.",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Materials unlocked",
    desc: "Training resources are now in your library.",
  },
  {
    id: 4,
    icon: Mail,
    title: "Downloaded",
    desc: "A copy is emailed — ready for your CV.",
  },
];

// ─── Components ────────────────────────────────────────

function SkilloraSeal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="13" r="9" fill="#E7ECFE" />
      <circle cx="16" cy="13" r="9" stroke="#4C6EF5" strokeWidth="1.4" />
      <path
        d="M12 13.3l2.4 2.4 5-5.2"
        stroke="#31469C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 20.5L9 30l7-3.5 7 3.5-2.5-9.5"
        stroke="#4C6EF5"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="#E7ECFE"
      />
    </svg>
  );
}

function CertSealLarge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 76" fill="none">
      <circle cx="38" cy="30" r="20" fill="#E7ECFE" />
      <circle cx="38" cy="30" r="20" stroke="#4C6EF5" strokeWidth="1.6" />
      <circle
        cx="38"
        cy="30"
        r="14"
        stroke="#31469C"
        strokeWidth="1.2"
        strokeDasharray="2 3"
      />
      <path
        d="M30 30.5l5.5 5.5L48 23"
        stroke="#1C2657"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 46l-6 22 16-8 16 8-6-22"
        stroke="#4C6EF5"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="#E7ECFE"
      />
    </svg>
  );
}

function Confetti() {
  const [pieces, setPieces] = useState<
    Array<{
      id: number;
      left: string;
      color: string;
      rotate: number;
      dur: number;
      drift: number;
    }>
  >([]);

  useEffect(() => {
    const colors = ["#4C6EF5", "#31469C", "#E7ECFE", "#1C2657", "#8AA1FF"];
    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${30 + Math.random() * 40}vw`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
      dur: 1.4 + Math.random() * 1.1,
      drift: Math.random() * 160 - 80,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="fixed top-[-16px] md:top-[-20px] w-[7px] md:w-2 h-3 md:h-[14px] rounded-sm pointer-events-none z-[200]"
          style={{
            left: p.left,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.dur}s cubic-bezier(.2,.6,.3,1) forwards`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 75vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ─── Main Component ────────────────────────────────────

export default function SkilloraCertificatePayment({
  examId,
  score,
}: SkilloraCertificatePaymentProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>("eligible");
  const [paid, setPaid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<ModalStage>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loadingExam, setLoadingExam] = useState(true);
  const [litTimeline, setLitTimeline] = useState<number[]>([]);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({
    msg: "",
    show: false,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paystackProcessing, setPaystackProcessing] = useState(false);
  const [examData, setExamData] = useState<any>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch exam data on mount
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
          setLitTimeline([1, 2, 3, 4]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch exam data:", err);
    } finally {
      setLoadingExam(false);
    }
  };

  const initializePayment = async () => {
    setInitializingPayment(true);
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId: examData.examId,
          amount: 5000,
          type: "certificate",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Could not start payment");
        return;
      }
      setPaymentReference(data.reference); // server-generated reference
    } catch (err) {
      showToast("Could not start payment. Please try again.");
    } finally {
      setInitializingPayment(false);
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

  const handleViewState = (state: ViewState) => {
    setCurrentView(state);
    if (paid) return;
    if (state === "almost") {
      showToast(
        "This state has no payment action yet — finish the course to continue.",
      );
    }
  };

  const handleHeroCta = () => {
    if (paid) {
      handleDownload();
      return;
    }
    if (currentView === "almost") {
      showToast("Redirecting you back into the course…");
      return;
    }
    setModalStage("method");
    setSelectedMethod(null);
    initializePayment();
    setModalOpen(true);
    setActiveStep(2);
  };

  const selectMethod = (m: PaymentMethod) => {
    setSelectedMethod(m);
  };

  // Paystack success handler
  const handlePaystackSuccess = async (reference: string) => {
    setPaystackProcessing(true);
    setModalStage("processing");
    setActiveStep(3);

    try {
      // Verify payment server-side
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reference, examId: examData?._id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment verification failed");
      }

      setActiveStep(4);
      setModalStage("success");
    } catch (err: any) {
      showToast(err.message || "Payment failed. Please try again.");
      setModalStage("method");
    } finally {
      setPaystackProcessing(false);
    }
  };

  const submitPayment = async () => {
    if (selectedMethod === "paystack") {
      // Paystack handles its own popup, just show processing state
      setPaystackProcessing(true);
      return;
    }

    // For other methods (card, bank, wallet) — mock processing
    setModalStage("processing");
    setActiveStep(3);
    setTimeout(() => {
      setActiveStep(4);
      setModalStage("success");
    }, 1600);
  };

  const finishPayment = () => {
    setModalOpen(false);
    setPaid(true);
    setActiveStep(5);
    setLitTimeline([1, 2]);
    setShowConfetti(true);
    showToast("Certificate unlocked — congratulations!");
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleDownload = async () => {
    if (!paid) {
      showToast("Complete payment first to download your certificate.");
      return;
    }

    setActiveStep(6);
    showToast("Preparing your download…");

    try {
      const res = await fetch(`/api/certificates/${examData._id}/download`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to download certificate.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${examData._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLitTimeline([1, 2, 3, 4]);
      showToast("Downloaded! A copy was emailed to you.");
    } catch (err) {
      showToast("Something went wrong. Please try again.");
    }
  };

  const v = paid
    ? {
        eyebrow: "Certificate Unlocked",
        title: (
          <>
            You did
            <br />
            it<em className="text-[#4C6EF5]">.</em>
          </>
        ),
        sub: "Your Skillora Certificate has been generated. Download it now and unlock your training materials.",
        btn: "Download My Certificate",
        showChecklist: true,
        note: (
          <>
            Payment confirmed — <b>receipt sent to your email</b>.
          </>
        ),
      }
    : VIEWS[currentView];

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-[#12162B] font-sans antialiased pb-24 md:pb-0">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      <div className="px-5 md:px-12 md:max-w-[1180px] md:mx-auto">
        {/* Hero */}
        <section className="pt-7 pb-2 md:pt-[70px] md:pb-[84px] md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:items-center">
          <div>
            <div className="inline-flex items-center gap-[7px] md:gap-2 bg-[#E7ECFE] text-[#31469C] text-[11.5px] md:text-[12.5px] font-bold tracking-[0.4px] md:tracking-[0.5px] uppercase px-3 py-[6px] md:px-[14px] md:py-[7px] pr-3 md:pr-[14px] pl-[9px] md:pl-[10px] rounded-full mb-4 md:mb-[22px]">
              <span className="w-[6px] h-[6px] md:w-[7px] md:h-[7px] rounded-full bg-[#4C6EF5] animate-pulse" />
              <span>{v.eyebrow}</span>
            </div>

            <h1 className="font-semibold italic text-[34px] md:text-[52px] leading-[1.08] md:leading-[1.05] tracking-[-0.3px] md:tracking-[-0.5px] mb-[14px] md:mb-5 text-[#12162B]">
              {v.title}
            </h1>

            <p className="text-[14.5px] md:text-[16.5px] leading-[1.6] md:leading-[1.65] text-[#565C77] max-w-[480px] mb-6 md:mb-8 transition-all duration-300">
              {v.sub}
            </p>

            {v.showChecklist && (
              <div className="flex flex-col gap-[11px] md:gap-[13px] mb-6 md:mb-9">
                {[
                  "All required learning modules completed",
                  "Assessment passed",
                  "Profile details verified for your certificate",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-[10px] md:gap-3 text-[13.5px] md:text-[14.5px] font-medium text-[#12162B]"
                  >
                    <span className="flex-shrink-0 w-[18px] h-[18px] md:w-5 md:h-5 rounded-[6px] md:rounded-[7px] bg-[#E7ECFE] flex items-center justify-center mt-[1px]">
                      <Check
                        className="w-[10px] h-[10px] md:w-[11px] md:h-[11px] text-[#31469C]"
                        strokeWidth={2.5}
                      />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-5">
              <Button
                onClick={handleHeroCta}
                className={cn(
                  "bg-[#4C6EF5] hover:bg-[#3D5EE8] active:bg-[#3453D6] text-white font-bold text-[15px] px-5 md:px-[30px] py-[15px] md:py-4 h-auto rounded-xl md:rounded-[11px] w-full md:w-auto shadow-[0_10px_22px_-10px_rgba(76,110,245,0.55)] md:shadow-[0_12px_24px_-10px_rgba(76,110,245,0.55)] transition-all duration-150 relative overflow-hidden",
                  paid && "md:shadow-none",
                )}
              >
                {v.btn}
              </Button>
              <span className="text-[12px] md:text-[13px] text-[#8A8FA8] font-medium md:mt-0">
                {v.note}
              </span>
            </div>
          </div>

          {/* Certificate Visual */}
          <div className="relative mt-6 md:mt-0 flex items-center justify-center md:perspective-[900px] group">
            <div className="w-full max-w-[430px] aspect-[16/11] md:aspect-[4/3] bg-gradient-to-br from-[#F7F9FF] to-white border border-[#E7E9F3] rounded-[20px] md:rounded-[22px] shadow-[0_24px_48px_-28px_rgba(28,38,87,0.35)] md:shadow-[0_40px_70px_-40px_rgba(28,38,87,0.35)] p-[26px] md:p-[34px] relative overflow-hidden transition-all duration-400 md:group-hover:shadow-[0_50px_90px_-40px_rgba(28,38,87,0.45)] md:group-hover:-translate-y-1 md:group-hover:rotate-y-[-4deg] md:group-hover:rotate-x-[3deg]">
              <div className="absolute inset-[10px] md:inset-3 border-[1.4px] md:border-[1.5px] border-dashed border-[#C7D3FC] rounded-xl md:rounded-[14px] transition-colors duration-400" />
              <div className="relative h-full flex flex-col items-center justify-center text-center gap-[7px] md:gap-[10px]">
                <CertSealLarge
                  className={cn(
                    "w-[58px] h-[58px] md:w-[76px] md:h-[76px] transition-transform duration-500",
                    paid && "scale-110 md:scale-[1.08] -rotate-[4deg]",
                  )}
                />
                <div className="font-semibold text-[15.5px] md:text-[19px] text-[#1C2657] mt-1 md:mt-[6px]">
                  Certificate of Completion
                </div>
                <div className="w-[90px] md:w-[120px] h-[2px] bg-[#C7D3FC] rounded-full my-[2px] md:my-1" />
                <div
                  className={cn(
                    "text-[10.5px] md:text-[12.5px] font-semibold tracking-[0.3px] transition-colors duration-300",
                    paid ? "text-[#31469C]" : "text-[#8A8FA8]",
                  )}
                >
                  {paid ? "SKILLORA · CERTIFIED" : "SKILLORA · PENDING PAYMENT"}
                </div>
              </div>
            </div>

            {/* Lock Pill */}
            <div
              className={cn(
                "absolute -bottom-3.5 right-2.5 md:-bottom-[18px] md:-right-3.5 flex items-center gap-2 md:gap-[10px] px-[14px] py-[11px] md:px-[18px] md:py-[14px] rounded-[13px] md:rounded-2xl shadow-[0_14px_28px_-12px_rgba(28,38,87,0.5)] md:shadow-[0_20px_36px_-16px_rgba(28,38,87,0.5)] text-white text-[11.5px] md:text-[13px] font-semibold transition-colors duration-400",
                paid ? "bg-[#4C6EF5]" : "bg-[#1C2657]",
              )}
            >
              {paid ? (
                <Unlock className="w-[14px] h-[14px] md:w-4 md:h-4 flex-shrink-0" />
              ) : (
                <Lock className="w-[14px] h-[14px] md:w-4 md:h-4 flex-shrink-0" />
              )}
              <span>
                {paid ? "Unlocked" : "Locked"}
                <span
                  className={cn(
                    "block text-[9.5px] md:text-[11px] font-medium mt-[1px]",
                    paid ? "text-[#E7ECFE]" : "text-[#B9C4FF]",
                  )}
                >
                  {paid ? "Ready to download" : "Unlocks on payment"}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Payment Steps */}
        <section className="py-9 md:py-[70px] border-t border-[#E7E9F3]">
          <div className="md:flex md:justify-between md:items-end md:mb-11 md:gap-[30px]">
            <div>
              <span className="text-[11px] md:text-xs font-bold tracking-[1.2px] md:tracking-[1.4px] uppercase text-[#4C6EF5] mb-2 md:mb-[10px] block">
                Payment Steps
              </span>
              <h2 className="font-semibold text-[22px] md:text-[30px] tracking-[-0.2px] md:tracking-[-0.3px] mb-2 md:mb-0 text-[#12162B]">
                Six steps to your certificate
              </h2>
            </div>
            <p className="hidden md:block text-[14.5px] text-[#565C77] max-w-[360px] text-right leading-[1.55]">
              From checkout to download — the whole flow finishes in one
              sitting.
            </p>
          </div>
          <p className="md:hidden text-[13.5px] text-[#565C77] leading-[1.55] mb-6">
            From checkout to download — finished in one sitting.
          </p>

          {/* Mobile: Vertical Stepper */}
          <div className="md:hidden flex flex-col">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={cn(
                  "flex gap-[14px] relative pb-[22px]",
                  i === STEPS.length - 1 && "pb-0",
                )}
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-[2px] bg-[#E7ECFE]" />
                )}
                <div
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center font-semibold text-sm z-[1] transition-all duration-300",
                    step.num < activeStep
                      ? "bg-[#4C6EF5] border-[#4C6EF5] text-white"
                      : step.num === activeStep
                        ? "border-[#4C6EF5] text-[#31469C] shadow-[0_0_0_5px_#E7ECFE]"
                        : "border-[#E7ECFE] text-[#31469C]",
                  )}
                >
                  {step.num}
                </div>
                <div>
                  <div className="text-sm font-bold mb-[3px]">{step.title}</div>
                  <div className="text-[12.5px] text-[#8A8FA8] leading-[1.5]">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal Stepper */}
          <div className="hidden md:grid md:grid-cols-6 gap-0 relative">
            <div className="absolute top-[23px] left-[8%] right-[8%] h-[2px] bg-[#E7ECFE] z-0" />
            <div
              className="absolute top-[23px] left-[8%] h-[2px] bg-[#4C6EF5] z-0 transition-all duration-600"
              style={{ width: `${((activeStep - 1) / 5) * 84}%` }}
            />
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative z-[1] flex flex-col items-center text-center px-[10px]"
              >
                <div
                  className={cn(
                    "w-[46px] h-[46px] rounded-full bg-white border-2 flex items-center justify-center font-semibold text-base mb-4 transition-all duration-300",
                    step.num < activeStep
                      ? "bg-[#4C6EF5] border-[#4C6EF5] text-white"
                      : step.num === activeStep
                        ? "border-[#4C6EF5] text-[#31469C] shadow-[0_0_0_6px_#E7ECFE]"
                        : "border-[#E7ECFE] text-[#31469C]",
                  )}
                >
                  {step.num}
                </div>
                <div className="text-[13.5px] font-bold mb-[6px]">
                  {step.title}
                </div>
                <div className="text-[12.5px] text-[#8A8FA8] leading-[1.5]">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Pay */}
        <section className="py-9 md:py-[70px] border-t border-[#E7E9F3]">
          <div className="md:flex md:justify-between md:items-end md:mb-11 md:gap-[30px]">
            <div>
              <span className="text-[11px] md:text-xs font-bold tracking-[1.2px] md:tracking-[1.4px] uppercase text-[#4C6EF5] mb-2 md:mb-[10px] block">
                Why Pay
              </span>
              <h2 className="font-semibold text-[22px] md:text-[30px] tracking-[-0.2px] md:tracking-[-0.3px] text-[#12162B]">
                What your payment covers
              </h2>
            </div>
            <p className="hidden md:block text-[14.5px] text-[#565C77] max-w-[360px] text-right leading-[1.55]">
              Every certificate is processed, verified, and kept valid for as
              long as you need it.
            </p>
          </div>

          {/* Mobile: Vertical List */}
          <div className="md:hidden flex flex-col border border-[#E7E9F3] rounded-[14px] overflow-hidden">
            {WHY_PAY.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "px-[18px] py-[18px]",
                  i < WHY_PAY.length - 1 && "border-b border-[#E7E9F3]",
                )}
              >
                <span className="italic text-xs text-[#4C6EF5] font-semibold block mb-2">
                  {item.num}
                </span>
                <h3 className="text-sm font-bold mb-[5px]">{item.title}</h3>
                <p className="text-[12.5px] text-[#565C77] leading-[1.5]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-px bg-[#E7E9F3] border border-[#E7E9F3] rounded-2xl overflow-hidden">
            {WHY_PAY.map((item, i) => (
              <div
                key={i}
                className="bg-white p-[30px] md:px-7 transition-colors duration-250 hover:bg-[#FAFBFF]"
              >
                <span className="italic text-[13px] text-[#4C6EF5] font-semibold block mb-[14px]">
                  {item.num}
                </span>
                <h3 className="text-[15.5px] font-bold mb-2">{item.title}</h3>
                <p className="text-[13.5px] text-[#565C77] leading-[1.55]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Status States */}
        <section className="py-9 md:py-[70px] border-t border-[#E7E9F3]">
          <div className="md:flex md:justify-between md:items-end md:mb-11 md:gap-[30px]">
            <div>
              <span className="text-[11px] md:text-xs font-bold tracking-[1.2px] md:tracking-[1.4px] uppercase text-[#4C6EF5] mb-2 md:mb-[10px] block">
                Qualification Status
              </span>
              <h2 className="font-semibold text-[22px] md:text-[30px] tracking-[-0.2px] md:tracking-[-0.3px] text-[#12162B]">
                Where you stand today
              </h2>
            </div>
            <p className="hidden md:block text-[14.5px] text-[#565C77] max-w-[360px] text-right leading-[1.55]">
              Try each state — the screen adapts to a learner's progress
              automatically.
            </p>
          </div>
          <p className="md:hidden text-[13.5px] text-[#565C77] leading-[1.55] mb-6">
            Swipe — the screen adapts to a learner's progress automatically.
          </p>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden flex gap-[14px] overflow-x-auto -mx-5 px-5 pb-1.5 snap-x snap-mandatory scrollbar-hide">
            {[
              {
                id: "eligible",
                tag: "Eligible for certificate",
                title: "Congratulations!",
                desc: "You qualify for your Skillora Certification. Pay to unlock it.",
                variant: "eligible" as const,
              },
              {
                id: "almost",
                tag: "Almost qualified",
                title: "You're very close",
                desc: "Finish the remaining requirements, then come back to pay.",
                variant: "almost" as const,
              },
              {
                id: "pending",
                tag: "Payment pending",
                title: "Your certificate is waiting",
                desc: "Complete payment to access your certificate and materials.",
                variant: "pending" as const,
              },
            ].map((card) => (
              <div
                key={card.id}
                className={cn(
                  "flex-shrink-0 w-[78%] snap-start rounded-2xl p-[22px] flex flex-col gap-3 min-h-[190px] transition-transform duration-200",
                  card.variant === "eligible" && "bg-[#1C2657] text-white",
                  card.variant === "almost" &&
                    "bg-[#FAFBFF] border border-[#E7E9F3] text-[#12162B]",
                  card.variant === "pending" && "bg-[#E7ECFE] text-[#1C2657]",
                  currentView === card.id &&
                    !paid &&
                    "outline outline-2 outline-[#4C6EF5] outline-offset-2",
                )}
              >
                <span className="text-[10.5px] font-bold tracking-[0.6px] uppercase opacity-70">
                  {card.tag}
                </span>
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p
                  className={cn(
                    "text-[12.5px] leading-[1.55]",
                    card.variant === "eligible" && "text-[#C9D3FF]",
                    card.variant === "almost" && "text-[#565C77]",
                    card.variant === "pending" && "text-[#31469C]",
                  )}
                >
                  {card.desc}
                </p>
                <button
                  onClick={() => handleViewState(card.id as ViewState)}
                  className={cn(
                    "mt-auto self-start text-xs font-bold px-[14px] py-2 rounded-lg border-none cursor-pointer font-inherit transition-colors duration-150",
                    card.variant === "eligible" &&
                      "bg-[#4C6EF5] text-white hover:bg-[#3D5EE8]",
                    card.variant === "almost" &&
                      "bg-white text-[#31469C] border border-[#E7E9F3] hover:bg-[#E7ECFE]",
                    card.variant === "pending" &&
                      "bg-[#1C2657] text-white hover:bg-[#31469C]",
                  )}
                >
                  View this state
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-[22px]">
            {[
              {
                id: "eligible",
                tag: "Eligible for certificate",
                title: "Congratulations!",
                desc: "You've met every course requirement and qualify for your Skillora Certification. Pay to unlock it.",
                variant: "eligible" as const,
              },
              {
                id: "almost",
                tag: "Almost qualified",
                title: "You're very close",
                desc: "Finish the remaining course requirements, then come back to complete payment. Keep going.",
                variant: "almost" as const,
              },
              {
                id: "pending",
                tag: "Payment pending",
                title: "Your certificate is waiting",
                desc: "Complete your payment to access your certificate and premium training materials.",
                variant: "pending" as const,
              },
            ].map((card) => (
              <div
                key={card.id}
                className={cn(
                  "rounded-[18px] p-[30px] flex flex-col gap-[14px] min-h-[210px] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_22px_40px_-22px_rgba(28,38,87,0.3)]",
                  card.variant === "eligible" && "bg-[#1C2657] text-white",
                  card.variant === "almost" &&
                    "bg-[#FAFBFF] border border-[#E7E9F3] text-[#12162B]",
                  card.variant === "pending" && "bg-[#E7ECFE] text-[#1C2657]",
                  currentView === card.id &&
                    !paid &&
                    "outline outline-2 outline-[#4C6EF5] outline-offset-[3px]",
                )}
              >
                <span className="text-[11px] font-bold tracking-[0.8px] uppercase opacity-70">
                  {card.tag}
                </span>
                <h3 className="font-semibold text-xl">{card.title}</h3>
                <p
                  className={cn(
                    "text-[13.5px] leading-[1.6]",
                    card.variant === "eligible" && "text-[#C9D3FF]",
                    card.variant === "almost" && "text-[#565C77]",
                    card.variant === "pending" && "text-[#31469C]",
                  )}
                >
                  {card.desc}
                </p>
                <button
                  onClick={() => handleViewState(card.id as ViewState)}
                  className={cn(
                    "mt-auto self-start text-[12.5px] font-bold px-4 py-[9px] rounded-lg border-none cursor-pointer font-inherit transition-colors duration-150",
                    card.variant === "eligible" &&
                      "bg-[#4C6EF5] text-white hover:bg-[#3D5EE8]",
                    card.variant === "almost" &&
                      "bg-white text-[#31469C] border border-[#E7E9F3] hover:bg-[#E7ECFE]",
                    card.variant === "pending" &&
                      "bg-[#1C2657] text-white hover:bg-[#31469C]",
                  )}
                >
                  View this state
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-9 md:py-[70px] border-t border-[#E7E9F3]">
          <div className="md:flex md:justify-between md:items-end md:mb-11 md:gap-[30px]">
            <div>
              <span className="text-[11px] md:text-xs font-bold tracking-[1.2px] md:tracking-[1.4px] uppercase text-[#4C6EF5] mb-2 md:mb-[10px] block">
                After Payment
              </span>
              <h2 className="font-semibold text-[22px] md:text-[30px] tracking-[-0.2px] md:tracking-[-0.3px] text-[#12162B]">
                What happens next
              </h2>
            </div>
            <p className="hidden md:block text-[14.5px] text-[#565C77] max-w-[360px] text-right leading-[1.55]">
              Everything below lights up automatically once payment is
              confirmed.
            </p>
          </div>
          <p className="md:hidden text-[13.5px] text-[#565C77] leading-[1.55] mb-6">
            These light up automatically once payment is confirmed.
          </p>

          {/* Mobile: Vertical Stack */}
          <div className="md:hidden flex flex-col gap-3">
            {TIMELINE.map((tl) => {
              const Icon = tl.icon;
              const isLit = litTimeline.includes(tl.id);
              return (
                <div
                  key={tl.id}
                  className={cn(
                    "bg-[#FAFBFF] border border-[#E7E9F3] rounded-[14px] p-4 flex gap-[14px] items-start transition-all duration-400",
                    isLit && "opacity-100 bg-white border-[#C7D3FC]",
                    !isLit && "opacity-45",
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-[34px] h-[34px] rounded-[9px] flex items-center justify-center transition-colors duration-400",
                      isLit ? "bg-[#4C6EF5]" : "bg-[#E7ECFE]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors duration-400",
                        isLit ? "text-white" : "text-[#31469C]",
                      )}
                      strokeWidth={1.6}
                    />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold mb-1">{tl.title}</h4>
                    <p className="text-[11.5px] text-[#8A8FA8] leading-[1.5]">
                      {tl.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-5">
            {TIMELINE.map((tl) => {
              const Icon = tl.icon;
              const isLit = litTimeline.includes(tl.id);
              return (
                <div
                  key={tl.id}
                  className={cn(
                    "bg-[#FAFBFF] border border-[#E7E9F3] rounded-2xl p-[26px] transition-all duration-400",
                    isLit &&
                      "opacity-100 bg-white border-[#C7D3FC] -translate-y-[3px]",
                    !isLit && "opacity-45",
                  )}
                >
                  <div
                    className={cn(
                      "w-[38px] h-[38px] rounded-[10px] flex items-center justify-center mb-[18px] transition-colors duration-400",
                      isLit ? "bg-[#4C6EF5]" : "bg-[#E7ECFE]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] transition-colors duration-400",
                        isLit ? "text-white" : "text-[#31469C]",
                      )}
                      strokeWidth={1.6}
                    />
                  </div>
                  <h4 className="text-[14.5px] font-bold mb-[7px]">
                    {tl.title}
                  </h4>
                  <p className="text-[12.5px] text-[#8A8FA8] leading-[1.55]">
                    {tl.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-9 md:pt-0 md:pb-[100px]">
          <div className="bg-[#1C2657] rounded-[20px] md:rounded-[26px] p-9 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute w-[320px] md:w-[520px] h-[320px] md:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(76,110,245,0.35),transparent_70%)] -top-40 md:-top-[260px] -right-[120px] md:-right-[160px] md:animate-[drift_8s_ease-in-out_infinite]" />
            <div className="relative max-w-[620px] mx-auto">
              <blockquote className="font-semibold italic text-[19px] md:text-[26px] leading-[1.5] mb-3 md:mb-[14px]">
                "Today isn't just about downloading a certificate — it's about
                the effort that brought you here."
              </blockquote>
              <div className="text-[#AEB9FF] text-[12.5px] md:text-sm font-semibold tracking-[0.2px] md:tracking-[0.3px] mb-6 md:mb-[34px]">
                Keep learning. Keep growing. Keep building.
              </div>
              <Button
                onClick={handleDownload}
                disabled={!paid}
                className={cn(
                  "bg-white text-[#1C2657] hover:bg-[#EDF0FF] font-bold text-[15px] px-5 md:px-[30px] py-[15px] md:py-4 h-auto rounded-xl md:rounded-[11px] shadow-none transition-all duration-150",
                  !paid &&
                    "bg-white/20 text-white/60 cursor-not-allowed hover:bg-white/20",
                )}
              >
                Download My Certificate
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#8A8FA8] text-[11.5px] md:text-[12.5px] py-[26px] md:py-[34px] md:pb-[50px]">
        Skillora Certification · your progress, verified.
      </footer>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 bg-white/95 backdrop-blur-[10px] border-t border-[#E7E9F3] px-5 py-3 pb-[calc(14px+env(safe-area-inset-bottom))] z-[60]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-xs text-[#8A8FA8] font-semibold leading-tight">
            Due today
            <b className="block text-[#12162B] text-base">
              {paid ? "Paid ✓" : "₦5,000"}
            </b>
          </div>
          <Button
            onClick={handleHeroCta}
            className="flex-1 bg-[#4C6EF5] hover:bg-[#3D5EE8] active:bg-[#3453D6] text-white font-bold text-[15px] h-12 rounded-xl shadow-[0_10px_22px_-10px_rgba(76,110,245,0.55)] transition-all duration-150"
          >
            {v.btn}
          </Button>
        </div>
      </div>

      {/* Payment Modal - Mobile: Sheet, Desktop: Dialog */}
      {isMobile ? (
        <Sheet open={modalOpen} onOpenChange={setModalOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-[22px] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] max-h-[82vh] overflow-y-auto border-0"
          >
            <div className="w-9 h-1 bg-[#E7E9F3] rounded-full mx-auto mb-4" />
            {renderModalContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="rounded-[22px] p-[34px] max-w-[420px] border-0 shadow-[0_60px_100px_-30px_rgba(18,22,43,0.4)]">
            <DialogHeader>
              <DialogTitle className="font-semibold text-[22px] text-[#12162B]">
                Choose a payment method
              </DialogTitle>
              <DialogDescription className="text-[13.5px] text-[#565C77]">
                Certificate processing fee — <b>₦5,000</b>
              </DialogDescription>
            </DialogHeader>
            {renderModalContent()}
          </DialogContent>
        </Dialog>
      )}

      {/* Toast */}
      <div
        className={cn(
          "fixed z-[150] flex items-center gap-[9px] md:gap-[10px] bg-[#1C2657] text-white px-4 md:px-5 py-[13px] md:py-[14px] rounded-xl shadow-[0_16px_32px_-14px_rgba(18,22,43,0.5)] md:shadow-[0_20px_40px_-16px_rgba(18,22,43,0.5)] transition-all duration-300",
          toast.show
            ? "translate-y-0 opacity-100"
            : "translate-y-[14px] md:translate-y-5 opacity-0",
          "left-4 right-4 bottom-[calc(90px+env(safe-area-inset-bottom))] md:left-auto md:right-7 md:bottom-7 md:text-[13.5px] text-[13px] font-semibold",
        )}
      >
        <span className="w-[7px] h-[7px] md:w-2 md:h-2 rounded-full bg-[#4C6EF5] flex-shrink-0" />
        <span>{toast.msg}</span>
      </div>

      {/* Custom keyframes for desktop drift */}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
      `}</style>
    </div>
  );

  // ─── Modal Content Renderer ────────────────────────────
  function renderModalContent() {
    if (modalStage === "method") {
      return (
        <>
          {/* Paystack Option */}
          <div
            onClick={() => selectMethod("paystack")}
            className={cn(
              "flex items-center gap-3 border-[1.5px] rounded-xl p-[13px] mb-2.5 cursor-pointer transition-all duration-150",
              selectedMethod === "paystack"
                ? "border-[#4C6EF5] bg-[#E7ECFE]"
                : "border-[#E7E9F3] hover:bg-[#FAFBFF]",
            )}
          >
            <div
              className={cn(
                "w-[17px] h-[17px] rounded-full border-2 flex-shrink-0 relative",
                selectedMethod === "paystack"
                  ? "border-[#4C6EF5]"
                  : "border-[#8A8FA8]",
              )}
            >
              {selectedMethod === "paystack" && (
                <div className="absolute inset-[3px] rounded-full bg-[#4C6EF5]" />
              )}
            </div>
            <svg
              className="w-6 h-6 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect width="24" height="24" rx="4" fill="#0BA4DB" />
              <path
                d="M7 12h10M7 8h10M7 16h6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex-1">
              <span className="text-[13.5px] font-semibold block">
                Pay with Paystack
              </span>
              <span className="text-[11px] text-[#8A8FA8]">
                Card, Bank, USSD, Transfer
              </span>
            </div>
          </div>

          {/* Other methods */}
          {[
            {
              id: "card" as const,
              label: "Debit / Credit Card",
              icon: CreditCard,
            },
            { id: "bank" as const, label: "Bank Transfer", icon: Landmark },
            { id: "wallet" as const, label: "Mobile Wallet", icon: Wallet },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => selectMethod(m.id)}
              className={cn(
                "flex items-center gap-3 border-[1.5px] rounded-xl p-[13px] mb-2.5 cursor-pointer transition-all duration-150",
                selectedMethod === m.id
                  ? "border-[#4C6EF5] bg-[#E7ECFE]"
                  : "border-[#E7E9F3] hover:bg-[#FAFBFF]",
              )}
            >
              <div
                className={cn(
                  "w-[17px] h-[17px] rounded-full border-2 flex-shrink-0 relative",
                  selectedMethod === m.id
                    ? "border-[#4C6EF5]"
                    : "border-[#8A8FA8]",
                )}
              >
                {selectedMethod === m.id && (
                  <div className="absolute inset-[3px] rounded-full bg-[#4C6EF5]" />
                )}
              </div>
              <m.icon
                className="w-6 h-6 flex-shrink-0 text-[#31469C]"
                strokeWidth={1.4}
              />
              <span className="text-[13.5px] font-semibold">{m.label}</span>
            </div>
          ))}

          {/* Pay Button */}
          {selectedMethod === "paystack" ? (
            loadingExam ||
            !examData ||
            initializingPayment ||
            !paymentReference ? (
              <Button disabled className="w-full h-12 rounded-xl mt-2">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {initializingPayment ? "Preparing payment..." : "Loading..."}
              </Button>
            ) : (
              <PaystackButton
                email={examData.userEmail || "user@example.com"}
                amount={5000}
                reference={paymentReference}
                metadata={{
                  examId: String(examData._id),
                  userId: String(examData.userId),
                  type: "certificate",
                }}
                onSuccess={handlePaystackSuccess}
                onCancel={() => showToast("Payment cancelled")}
                className="w-full bg-[#00C3F7] hover:bg-[#00A8D6] text-white font-bold text-[15px] h-12 rounded-xl mt-2"
              >
                Pay ₦5,000 with Paystack
              </PaystackButton>
            )
          ) : (
            <Button
              onClick={submitPayment}
              disabled={!selectedMethod || paystackProcessing}
              className="w-full bg-[#4C6EF5] hover:bg-[#3D5EE8] text-white font-bold text-[15px] h-12 rounded-xl mt-2 shadow-[0_10px_22px_-10px_rgba(76,110,245,0.55)] disabled:bg-[#E7ECFE] disabled:text-[#8A8FA8] disabled:shadow-none"
            >
              {paystackProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Pay ₦5,000"
              )}
            </Button>
          )}
        </>
      );
    }

    if (modalStage === "processing") {
      return (
        <div className="text-center py-1.5 pb-1">
          <Loader2 className="w-[38px] h-[38px] mx-auto mb-[18px] text-[#4C6EF5] animate-spin" />
          <h3 className="font-semibold text-[19px] mb-[5px] text-[#12162B]">
            Processing payment…
          </h3>
          <p className="text-[13px] text-[#565C77]">
            Please don't close this window.
          </p>
        </div>
      );
    }

    // success
    return (
      <>
        <div className="text-center py-1.5 pb-1">
          <div className="w-14 h-14 rounded-full bg-[#E7ECFE] flex items-center justify-center mx-auto mb-4">
            <Check
              className="w-[26px] h-[26px] text-[#31469C]"
              strokeWidth={2.6}
            />
          </div>
          <h3 className="font-semibold text-[19px] mb-[5px] text-[#12162B]">
            Payment successful
          </h3>
          <p className="text-[13px] text-[#565C77] mb-6">
            Your Skillora Certificate is unlocked.
          </p>
        </div>
        <Button
          onClick={finishPayment}
          className="w-full bg-[#4C6EF5] hover:bg-[#3D5EE8] text-white font-bold text-[15px] h-12 rounded-xl shadow-[0_10px_22px_-10px_rgba(76,110,245,0.55)]"
        >
          View my certificate
        </Button>
      </>
    );
  }
}
