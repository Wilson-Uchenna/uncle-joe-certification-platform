"use client";

import { ReactNode } from "react";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

export function HeroBanner({ title, subtitle, icon }: HeroBannerProps) {
  return (
    <div className="relative text-center py-9 px-6 rounded-[20px] mb-7 overflow-hidden bg-gradient-to-br from-[#2e1065] via-[#5b21b6] to-[#7c3aed]">
      <div className="absolute -top-1/2 -right-[20%] w-[300px] h-[300px] rounded-full bg-white/5" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[200px] h-[200px] rounded-full bg-white/[0.04]" />
      <div className="relative z-10">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
            {icon}
          </div>
        )}
        <h1 className="text-[22px] font-bold text-white mb-2.5">{title}</h1>
        <p className="text-[13.5px] text-white/85 leading-relaxed max-w-[520px] mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
