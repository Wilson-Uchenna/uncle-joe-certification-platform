"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  BarChart3,
  Award,
  Briefcase,
  FileText,
  Trophy,
  Gem,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Only Dashboard is a real, working link right now — everything else
// is disabled until registration/features go live.
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: false },
  { href: "/my-learning", label: "My Learning", icon: PlayCircle, disabled: true },
  { href: "/my-courses", label: "My Courses", icon: BookOpen, disabled: true },
  { href: "/learning-progress", label: "Learning Progress", icon: BarChart3, disabled: true },
  { href: "/certificates", label: "Certifications", icon: Award, disabled: true },
  { href: "/career-opportunities", label: "Career Opportunities", icon: Briefcase, disabled: true },
  { href: "/applications", label: "Applications", icon: FileText, disabled: true },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, disabled: true },
  { href: "/achievements", label: "Achievements", icon: Gem, disabled: true },
  { href: "/notifications", label: "Notifications", icon: Bell, disabled: true },
  { href: "/profile", label: "Profile", icon: User, disabled: true },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-slate-300 cursor-not-allowed select-none"
      >
        <Icon className="w-[18px] h-[18px]" />
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-amber-100 text-slate-900"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (lg and up) ===== */}
      <aside className="hidden lg:flex w-60 bg-white text-white flex-col flex-shrink-0">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-4 items-center my-4"
        >
          <img
            src="/company-logo.jpeg"
            alt="Company Logo"
            className="w-[10rem] md:w-[10rem]"
          />
        </Link>

        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER (below lg) ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white text-white">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-4 items-center my-4"
          >
            <img
              src="/company-logo.jpeg"
              alt="Company Logo"
              className="w-[6.5rem] md:w-[7rem]"
            />
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-white/10 transition-colors"
          >
            <span
              className={`block h-[2px] w-5 bg-slate-900 rounded-full transition-all duration-200 origin-center ${
                open ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-slate-900 rounded-full transition-all duration-200 ${
                open ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-slate-900 rounded-full transition-all duration-200 origin-center ${
                open ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-[600px] border-t border-slate-700" : "max-h-0"
          }`}
        >
          <nav className="px-4 py-3 flex flex-col gap-0.5 bg-slate-900">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}