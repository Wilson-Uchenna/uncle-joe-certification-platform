"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  FileCheck,
  Award,
  MoreHorizontal,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Learner = {
  id: string;
  name: string;
  email: string;
  skillLevel: string;
  state: string;
  country: string;
  examsTaken: number;
  certificatesEarned: number;
  lastActive: string;
  status: "active" | "suspended" | "banned";
};

/* ───────── Primaryc Color System ───────── */
const P = {
  light:      "#E8E0FF",
  lightHover: "#DDD1FF",
  lightActive:"#C4B3FF",
  normal:     "#7C5CFF",
  normalHover:"#6B4DEB",
  normalActive:"#5A3FD6",
  dark:       "#4A35B5",
  darkHover:  "#3D2D99",
  darkActive: "#31247A",
  darker:     "#1E1452",
};

const STATUS_STYLES = {
  active: {
    bg: "bg-[#22c55e]/10",
    text: "text-[#4ade80]",
    dot: "bg-[#4ade80]",
    border: "border-[#22c55e]/20",
    label: "Active",
  },
  suspended: {
    bg: "bg-[#f59e0b]/10",
    text: "text-[#fbbf24]",
    dot: "bg-[#fbbf24]",
    border: "border-[#f59e0b]/20",
    label: "Suspended",
  },
  banned: {
    bg: "bg-[#ef4444]/10",
    text: "text-[#f87171]",
    dot: "bg-[#f87171]",
    border: "border-[#ef4444]/20",
    label: "Banned",
  },
};

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Advanced: {
    bg: "bg-[#7C5CFF]/10",
    text: "text-[#A78BFF]",
    border: "border-[#7C5CFF]/20",
  },
  Mid: {
    bg: "bg-[#3b82f6]/10",
    text: "text-[#60a5fa]",
    border: "border-[#3b82f6]/20",
  },
  Entry: {
    bg: "bg-[#22c55e]/10",
    text: "text-[#4ade80]",
    border: "border-[#22c55e]/20",
  },
};

const AVATAR_COLORS = [
  "bg-[#7C5CFF]/20 text-[#A78BFF]",
  "bg-[#3b82f6]/20 text-[#60a5fa]",
  "bg-[#ef4444]/20 text-[#f87171]",
  "bg-[#f59e0b]/20 text-[#fbbf24]",
  "bg-[#22c55e]/20 text-[#4ade80]",
  "bg-[#ec4899]/20 text-[#f472b6]",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function LearnerManagement() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchLearners();
  }, [session, page, filter, search]);

  const fetchLearners = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/learners?page=${page}&filter=${filter}&search=${search}`
    );
    const data = await res.json();
    if (data.success) {
      setLearners(data.learners);
      setTotal(data.total);
    }
    setLoading(false);
  };

  const handleAction = async (
    userId: string,
    action: "ban" | "unban" | "suspend"
  ) => {
    const messages: Record<string, string> = {
      ban: "Ban this user? They will lose access immediately.",
      unban: "Restore this user? They will regain full access.",
      suspend: "Suspend this user? They will be temporarily restricted.",
    };
    if (!confirm(messages[action])) return;

    const res = await fetch(`/api/admin/learners/${userId}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) fetchLearners();
  };

  const handleView = (userId: string) => {
    router.push(`/admin/learners/${userId}`);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="w-full min-h-screen bg-[#0B0A14] text-[#E8E0FF] p-6 font-sans antialiased">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Learner Management
        </h1>
        <p className="text-[#8B85A4] text-sm">
          View, manage, and support all registered learners across your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Users,
            label: "Total Learners",
            value: total.toLocaleString(),
            color: P.normal,
            bg: "bg-[#7C5CFF]/10",
            text: "text-[#A78BFF]",
          },
          {
            icon: Activity,
            label: "Active Now",
            value: learners.filter((l) => l.status === "active").length,
            color: "#22c55e",
            bg: "bg-[#22c55e]/10",
            text: "text-[#4ade80]",
          },
          {
            icon: FileCheck,
            label: "Total Exams",
            value: learners.reduce((sum, l) => sum + l.examsTaken, 0).toLocaleString(),
            color: "#3b82f6",
            bg: "bg-[#3b82f6]/10",
            text: "text-[#60a5fa]",
          },
          {
            icon: Award,
            label: "Certificates",
            value: learners.reduce((sum, l) => sum + l.certificatesEarned, 0).toLocaleString(),
            color: "#f59e0b",
            bg: "bg-[#f59e0b]/10",
            text: "text-[#fbbf24]",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#13121F] border border-[#1E1C2E] rounded-2xl p-5 hover:border-[#2A2740] transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <span className="text-[#6B668A] text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A557A]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#13121F] border border-[#1E1C2E] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4A4568] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/40 transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#13121F] border border-[#1E1C2E] rounded-xl px-4 py-2.5 text-sm text-[#B0ABCC] focus:outline-none focus:border-[#7C5CFF] cursor-pointer hover:border-[#2A2740] transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#13121F] border border-[#1E1C2E] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1C2E] bg-[#0F0E1A]">
                {["Learner", "Level", "Location", "Exams", "Certificates", "Status", "Last Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold text-[#6B668A] uppercase tracking-wider ${
                        h === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1C2E]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-[#6B668A]">
                      <div className="w-6 h-6 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading learners...</span>
                    </div>
                  </td>
                </tr>
              ) : learners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#5A557A] text-sm">
                    No learners found matching your criteria.
                  </td>
                </tr>
              ) : (
                learners.map((learner) => {
                  const status = STATUS_STYLES[learner.status];
                  const level = LEVEL_STYLES[learner.skillLevel] || LEVEL_STYLES.Entry;
                  const avatarColor = getAvatarColor(learner.name);

                  return (
                    <tr
                      key={learner.id}
                      className="hover:bg-[#1A1830] transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor} ring-2 ring-transparent group-hover:ring-[#7C5CFF]/20 transition-all`}
                          >
                            {getInitials(learner.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-[#E8E0FF] transition-colors">
                              {learner.name}
                            </p>
                            <p className="text-xs text-[#5A557A]">
                              {learner.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${level.bg} ${level.text} border ${level.border}`}
                        >
                          {learner.skillLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8B85A4]">
                        {learner.state}, {learner.country}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold tabular-nums">
                        {learner.examsTaken}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold tabular-nums">
                        {learner.certificatesEarned}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5A557A]">
                        {learner.lastActive}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(learner.id)}
                            className="p-2 rounded-lg text-[#5A557A] hover:text-[#A78BFF] hover:bg-[#7C5CFF]/10 transition-all"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {learner.status === "active" && (
                            <>
                              <button
                                onClick={() => handleAction(learner.id, "suspend")}
                                className="p-2 rounded-lg text-[#5A557A] hover:text-[#fbbf24] hover:bg-[#f59e0b]/10 transition-all"
                                title="Suspend"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(learner.id, "ban")}
                                className="p-2 rounded-lg text-[#5A557A] hover:text-[#f87171] hover:bg-[#ef4444]/10 transition-all"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {learner.status === "suspended" && (
                            <>
                              <button
                                onClick={() => handleAction(learner.id, "unban")}
                                className="p-2 rounded-lg text-[#5A557A] hover:text-[#4ade80] hover:bg-[#22c55e]/10 transition-all"
                                title="Restore"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(learner.id, "ban")}
                                className="p-2 rounded-lg text-[#5A557A] hover:text-[#f87171] hover:bg-[#ef4444]/10 transition-all"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {learner.status === "banned" && (
                            <button
                              onClick={() => handleAction(learner.id, "unban")}
                              className="p-2 rounded-lg text-[#5A557A] hover:text-[#4ade80] hover:bg-[#22c55e]/10 transition-all"
                              title="Restore"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-sm text-[#5A557A]">
          Showing <span className="text-[#E8E0FF] font-semibold">{learners.length}</span> of{" "}
          <span className="text-[#E8E0FF] font-semibold">{total.toLocaleString()}</span> learners
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-[#1E1C2E] text-[#5A557A] hover:text-white hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[40px] px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#7C5CFF] text-white shadow-lg shadow-[#7C5CFF]/25"
                    : "border border-[#1E1C2E] text-[#5A557A] hover:text-white hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10"
                }`}
              >
                {p}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="text-[#3A3560] px-1">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="min-w-[40px] px-3 py-2 rounded-xl border border-[#1E1C2E] text-[#5A557A] hover:text-white hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-all text-sm font-semibold"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="p-2.5 rounded-xl border border-[#1E1C2E] text-[#5A557A] hover:text-white hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}