"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  Award,
  BookOpen,
  Mail,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkilloraCertificateProps {
  examId: string;
  score: number;
}

// ─── Types ─────────────────────────────────────────────
interface TimelineItem {
  id: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
}

// ─── Constants ─────────────────────────────────────────
const TIMELINE: TimelineItem[] = [
  {
    id: 1,
    icon: Check,
    title: "Assessment passed",
    desc: "You've met all course requirements.",
  },
  {
    id: 2,
    icon: Award,
    title: "Certificate generated",
    desc: "Your certificate has been prepared.",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Materials unlocked",
    desc: "Training resources are in your library.",
  },
  {
    id: 4,
    icon: Mail,
    title: "Ready to download",
    desc: "Download or share your certificate anytime.",
  },
];

// ─── Components ────────────────────────────────────────

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

// ─── Main Component ────────────────────────────────────

export default function SkilloraCertificate({
  examId,
}: SkilloraCertificateProps) {
  const [loadingExam, setLoadingExam] = useState(true);
  const [litTimeline, setLitTimeline] = useState<number[]>([]);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({
    msg: "",
    show: false,
  });
  const [examData, setExamData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

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
        // Light up timeline based on certificate readiness
        if (data.result.certificatePaidAt || data.result.certificateUrl) {
          setLitTimeline([1, 2, 3, 4]);
        } else {
          setLitTimeline([1, 2]);
        }
      }
    } catch (err) {
      showToast("Failed to load certificate data.");
    } finally {
      setLoadingExam(false);
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

  const handleDownload = async () => {
    if (!examData) {
      showToast("Still loading your certificate — try again in a moment.");
      return;
    }

    setDownloading(true);
    showToast("Preparing your download…");

    try {
      const res = await fetch(`/api/certificates/${examData._id}/download`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to download certificate.");
        setDownloading(false);
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
    } finally {
      setDownloading(false);
    }
  };

  const isReady =
    examData?.certificatePaidAt != null || examData?.certificateUrl != null;

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-[#12162B] font-sans antialiased pb-24 md:pb-0">
      <div className="px-5 md:px-12 md:max-w-[1180px] md:mx-auto">
        {/* Hero */}
        <section className="pt-7 pb-2 md:pt-[70px] md:pb-[84px] md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:items-center">
          <div>
            <div className="inline-flex items-center gap-[7px] md:gap-2 bg-[#E7ECFE] text-[#31469C] text-[11.5px] md:text-[12.5px] font-bold tracking-[0.4px] md:tracking-[0.5px] uppercase px-3 py-[6px] md:px-[14px] md:py-[7px] pr-3 md:pr-[14px] pl-[9px] md:pl-[10px] rounded-full mb-4 md:mb-[22px]">
              <span className="w-[6px] h-[6px] md:w-[7px] md:h-[7px] rounded-full bg-[#4C6EF5] animate-pulse" />
              <span>Certificate</span>
            </div>

            <h1 className="font-semibold italic text-[34px] md:text-[52px] leading-[1.08] md:leading-[1.05] tracking-[-0.3px] md:tracking-[-0.5px] mb-[14px] md:mb-5 text-[#12162B]">
              You did
              <br />
              it<em className="text-[#4C6EF5]">.</em>
            </h1>

            <p className="text-[14.5px] md:text-[16.5px] leading-[1.6] md:leading-[1.65] text-[#565C77] max-w-[480px] mb-6 md:mb-8 transition-all duration-300">
              {isReady
                ? "Your A.R.W.P Certificate has been generated. Download it now and access your training materials."
                : "You've put in the work. Your certificate is being prepared — check back shortly."}
            </p>

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

            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-5">
              <Button
                onClick={handleDownload}
                disabled={!isReady || downloading || loadingExam}
                className={cn(
                  "bg-[#4C6EF5] hover:bg-[#3D5EE8] active:bg-[#3453D6] text-white font-bold text-[15px] px-5 md:px-[30px] py-[15px] md:py-4 h-auto rounded-xl md:rounded-[11px] w-full md:w-auto shadow-[0_10px_22px_-10px_rgba(76,110,245,0.55)] md:shadow-[0_12px_24px_-10px_rgba(76,110,245,0.55)] transition-all duration-150 relative overflow-hidden",
                  (!isReady || downloading) && "opacity-60 cursor-not-allowed",
                )}
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {downloading
                  ? "Preparing…"
                  : isReady
                    ? "Download My Certificate"
                    : "Certificate Preparing…"}
              </Button>
              <span className="text-[12px] md:text-[13px] text-[#8A8FA8] font-medium md:mt-0">
                {isReady
                  ? "Available now — PDF format"
                  : "Usually ready within 24 hours"}
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
                    isReady && "scale-110 md:scale-[1.08] -rotate-[4deg]",
                  )}
                />
                <div className="font-semibold text-[15.5px] md:text-[19px] text-[#1C2657] mt-1 md:mt-[6px]">
                  Certificate of Completion
                </div>
                <div className="w-[90px] md:w-[120px] h-[2px] bg-[#C7D3FC] rounded-full my-[2px] md:my-1" />
                <div
                  className={cn(
                    "text-[10.5px] md:text-[12.5px] font-semibold tracking-[0.3px] transition-colors duration-300",
                    isReady ? "text-[#31469C]" : "text-[#8A8FA8]",
                  )}
                >
                  {isReady
                    ? "A.R.W.P.C · CERTIFIED"
                    : "A.R.W.P.C · PREPARING"}
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className={cn(
                "absolute -bottom-3.5 right-2.5 md:-bottom-[18px] md:-right-3.5 flex items-center gap-2 md:gap-[10px] px-[14px] py-[11px] md:px-[18px] md:py-[14px] rounded-[13px] md:rounded-2xl shadow-[0_14px_28px_-12px_rgba(28,38,87,0.5)] md:shadow-[0_20px_36px_-16px_rgba(28,38,87,0.5)] text-white text-[11.5px] md:text-[13px] font-semibold transition-colors duration-400",
                isReady ? "bg-[#4C6EF5]" : "bg-[#1C2657]",
              )}
            >
              {isReady ? (
                <Check className="w-[14px] h-[14px] md:w-4 md:h-4 flex-shrink-0" />
              ) : (
                <Loader2 className="w-[14px] h-[14px] md:w-4 md:h-4 flex-shrink-0 animate-spin" />
              )}
              <span>
                {isReady ? "Ready" : "Preparing"}
                <span
                  className={cn(
                    "block text-[9.5px] md:text-[11px] font-medium mt-[1px]",
                    isReady ? "text-[#E7ECFE]" : "text-[#B9C4FF]",
                  )}
                >
                  {isReady ? "Download available" : "Check back soon"}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-9 md:py-[70px] border-t border-[#E7E9F3]">
          <div className="md:flex md:justify-between md:items-end md:mb-11 md:gap-[30px]">
            <div>
              <span className="text-[11px] md:text-xs font-bold tracking-[1.2px] md:tracking-[1.4px] uppercase text-[#4C6EF5] mb-2 md:mb-[10px] block">
                Your Progress
              </span>
              <h2 className="font-semibold text-[22px] md:text-[30px] tracking-[-0.2px] md:tracking-[-0.3px] text-[#12162B]">
                What happens next
              </h2>
            </div>
            <p className="hidden md:block text-[14.5px] text-[#565C77] max-w-[360px] text-right leading-[1.55]">
              Everything below updates automatically as your certificate is
              prepared.
            </p>
          </div>
          <p className="md:hidden text-[13.5px] text-[#565C77] leading-[1.55] mb-6">
            These update automatically as your certificate is prepared.
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
                disabled={!isReady || downloading}
                className={cn(
                  "bg-white text-[#1C2657] hover:bg-[#EDF0FF] font-bold text-[15px] px-5 md:px-[30px] py-[15px] md:py-4 h-auto rounded-xl md:rounded-[11px] shadow-none transition-all duration-150",
                  (!isReady || downloading) &&
                    "bg-white/20 text-white/60 cursor-not-allowed hover:bg-white/20",
                )}
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {downloading ? "Preparing…" : "Download My Certificate"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center text-[#8A8FA8] text-[11.5px] md:text-[12.5px] py-[26px] md:py-[34px] md:pb-[50px]">
        A.R.W.P.C · your progress, verified.
      </footer>

      {/* Toast */}
      <div
        className={cn(
          "fixed z-[150] flex items-center gap-[9px] md:gap-[10px] bg-[#1C2657] text-white px-4 md:px-5 py-[13px] md:py-[14px] rounded-xl shadow-[0_16px_32px_-14px_rgba(18,22,43,0.5)] md:shadow-[0_20px_40px_-16px_rgba(18,22,43,0.5)] transition-all duration-300",
          toast.show
            ? "translate-y-0 opacity-100"
            : "translate-y-[14px] md:translate-y-5 opacity-0",
          "left-4 right-4 bottom-6 md:left-auto md:right-7 md:bottom-7 md:text-[13.5px] text-[13px] font-semibold",
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
}