// components/results/ResultsCountdown.tsx
"use client";

import { useState, useEffect } from "react";
import { Lock, Clock } from "lucide-react";

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsAvailable(true);
        setTimeLeft(null);
        return true; // stop interval
      }

      setIsAvailable(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return false;
    };

    if (calculate()) return;
    const interval = setInterval(() => {
      if (calculate()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, isAvailable };
}

export function ResultsCountdown({
  availableAt,
  onAvailable,
}: {
  availableAt: string;
  onAvailable?: () => void;
}) {
  const { timeLeft, isAvailable } = useCountdown(availableAt);

  useEffect(() => {
    if (isAvailable && onAvailable) onAvailable();
  }, [isAvailable, onAvailable]);

  if (isAvailable) return null;

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6 border-2 border-violet-100">
          <Lock className="w-8 h-8 text-violet-600" />
        </div>

        <h1 className="text-2xl font-bold text-[#1e1b4b] mb-2">
          Results Processing
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Your detailed results are being finalized. They'll unlock automatically
          at the time below.
        </p>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {timeLeft &&
            [
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Mins" },
              { value: timeLeft.seconds, label: "Secs" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl p-3 border border-slate-200"
              >
                <div className="text-2xl font-bold text-violet-700">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-medium">
                  {item.label}
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Unlocks at {new Date(availableAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}