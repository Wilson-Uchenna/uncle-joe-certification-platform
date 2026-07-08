"use client"

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
    <aside className="w-82 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-2 items-center"
        >
          <img src="/skillora-3.png" alt="Company Logo" className="w-28 h-10" />
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
  );
}
