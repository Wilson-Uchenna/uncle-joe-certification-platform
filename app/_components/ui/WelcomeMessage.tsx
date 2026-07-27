"use client";

interface WelcomeMessageProps {
  title: string;
  message: string;
}

export function WelcomeMessage({ title, message }: WelcomeMessageProps) {
  return (
    <div className="bg-white rounded-2xl p-5 mb-5 border border-[#e9e4f0] text-center">
      <h3 className="text-[15px] font-bold text-[#2e1065] mb-1.5">{title}</h3>
      <p className="text-[13px] text-slate-500 leading-relaxed">{message}</p>
    </div>
  );
}
