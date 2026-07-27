"use client";

import { ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "light";
  className?: string;
  type?: "button" | "submit";
}

const purple = {
  normal: "#7c3aed",
  dark: "#5b21b6",
  darker: "#2e1065",
};

export function GradientButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: GradientButtonProps) {
  if (variant === "light") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-9 py-3.5 text-[15px] font-bold text-violet-900 bg-white rounded-[14px] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-9 py-3.5 text-[15px] font-bold text-white rounded-[14px] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${purple.normal}, ${purple.dark})`,
        boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = `linear-gradient(135deg, #6d28d9, #4c1d95)`;
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(124, 58, 237, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${purple.normal}, ${purple.dark})`;
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.3)";
      }}
    >
      {children}
    </button>
  );
}
