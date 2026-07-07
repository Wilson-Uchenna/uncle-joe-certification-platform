"use client";

import { Clock } from "lucide-react";

interface TimerProps {
  timeRemaining: number;
}

export function Timer({ timeRemaining }: TimerProps) {
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCriticalTime = timeRemaining < 60; // Less than 1 minute

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
        isCriticalTime
          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
          : isLowTime
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-violet-50 text-violet-700 border border-violet-200"
      }`}
    >
      <Clock className="w-4 h-4" />
      {formatTime(timeRemaining)}
    </div>
  );
}