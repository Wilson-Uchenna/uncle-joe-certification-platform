// components/TopNav.tsx
import Link from "next/link";

export function TopNav() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Progress Steps */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Learn
        </span>
        <span className="w-5 h-px bg-slate-300" />
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Get Certified
        </span>
        <span className="w-5 h-px bg-slate-300" />
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          Get Connected
        </span>
        <span className="w-5 h-px bg-slate-300" />
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          Get Hired
        </span>
      </div>

      {/* Right: Stage text + Take Exam button */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500">
          Stage — one course from your next certificate
        </span>

        <Link
          href="/assessment"
          className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors duration-150"
        >
          Take Exam
        </Link>
      </div>
    </header>
  );
}