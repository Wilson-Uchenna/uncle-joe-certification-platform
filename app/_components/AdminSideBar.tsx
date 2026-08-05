"use client";

import { authClient } from "@/lib/auth-client";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard Home",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    active: true,
  },
  { label: "Learner Management", icon: Users, href: "/admin/learners" },
  { label: "Employer Management", icon: Building2, href: "/admin/employers" },
  { label: "Course Management", icon: BookOpen, href: "/admin/courses" },
  {
    label: "Assessment Management",
    icon: ClipboardCheck,
    href: "/admin/assessment",
  },
  {
    label: "Certification Management",
    icon: Award,
    href: "/admin/certifications",
  },
  {
    label: "Internship Management",
    icon: Briefcase,
    href: "/admin/internships",
  },
  { label: "Remote Jobs", icon: Globe, href: "/admin/jobs" },
  { label: "Applications", icon: FileText, href: "/admin/applications" },
  { label: "Leaderboard", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Reports & Analytics", icon: TrendingUp, href: "/admin/reports" },
  { label: "Notifications", icon: Bell, href: "/admin/notifications" },
  { label: "Support Centre", icon: HelpCircle, href: "/admin/support" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSideBar() {
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
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-2 items-center"
          >
            <img
              src="/company-logo.jpeg"
              alt="Company Logo"
              className="w-[10rem] md:w-[10rem]"
            />
          </Link>

          <p className="text-xs text-gray-500 mt-1">Command Center</p>
        </div>

        <nav className="flex-2 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
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
              className={`block h-[2px] w-5 bg-slate-900  rounded-full transition-all duration-200 origin-center ${
                open ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-[750px] border-t border-slate-700" : "max-h-0"
          }`}
        >
          <nav className="px-4 py-3 flex flex-col gap-0.5 bg-slate-900">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-100 text-slate-900"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
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
