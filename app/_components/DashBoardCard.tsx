import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  linkText: string;
  href: string;
  icon: LucideIcon;
  iconColor: "blue" | "amber" | "emerald" | "rose" | "purple" | "teal" | "orange" | "indigo" | "slate";
  status?: string;
  statusVariant?: "neutral" | "success" | "warning" | "accent";
}

const iconColors = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  purple: "bg-purple-50 text-purple-600",
  teal: "bg-teal-50 text-teal-600",
  orange: "bg-orange-50 text-orange-600",
  indigo: "bg-indigo-50 text-indigo-600",
  slate: "bg-slate-50 text-slate-600",
};

const statusStyles = {
  neutral: "bg-slate-100 text-slate-500",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-700",
  accent: "bg-violet-50 text-violet-600",
};

export function DashboardCard({
  title,
  description,
  linkText,
  href,
  icon: Icon,
  iconColor,
  status,
  statusVariant = "neutral",
}: DashboardCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconColors[iconColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {status && (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[statusVariant]}`}>
            {status}
          </span>
        )}
      </div>

      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      <p className="text-[13px] text-slate-500 leading-relaxed flex-1">{description}</p>

      <Link
        href={href}
        className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-auto"
      >
        {linkText} <span className="text-emerald-500">→</span>
      </Link>
    </div>
  );
}