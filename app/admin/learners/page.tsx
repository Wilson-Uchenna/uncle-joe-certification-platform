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

const STATUS_STYLES = {
  active: {
    bg: "bg-[#22c55e]/10",
    text: "text-[#22c55e]",
    dot: "bg-[#22c55e]",
    label: "Active",
  },
  suspended: {
    bg: "bg-[#eab308]/10",
    text: "text-[#eab308]",
    dot: "bg-[#eab308]",
    label: "Suspended",
  },
  banned: {
    bg: "bg-[#ef4444]/10",
    text: "text-[#ef4444]",
    dot: "bg-[#ef4444]",
    label: "Banned",
  },
};

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Advanced: {
    bg: "bg-[#7c5cff]/10",
    text: "text-[#7c5cff]",
    border: "border-[#7c5cff]/20",
  },
  Mid: {
    bg: "bg-[#3b82f6]/10",
    text: "text-[#3b82f6]",
    border: "border-[#3b82f6]/20",
  },
  Entry: {
    bg: "bg-[#22c55e]/10",
    text: "text-[#22c55e]",
    border: "border-[#22c55e]/20",
  },
};

const AVATAR_COLORS = [
  "bg-[#7c5cff]/20 text-[#7c5cff]",
  "bg-[#3b82f6]/20 text-[#3b82f6]",
  "bg-[#ef4444]/20 text-[#ef4444]",
  "bg-[#f59e0b]/20 text-[#f59e0b]",
  "bg-[#22c55e]/20 text-[#22c55e]",
  "bg-[#ec4899]/20 text-[#ec4899]",
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
    <div className="w-full mx-auto min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Learner Management</h1>
        <p className="text-[#6b6b8a] text-sm">
          View, manage, and support all registered learners.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border border-[#1e1e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c5cff]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#7c5cff]" />
            </div>
            <span className="text-[#6b6b8a] text-xs font-medium uppercase tracking-wider">
              Total Learners
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{total.toLocaleString()}</p>
        </div>

        <div className="bg-gray-50 border border-[#1e1e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#22c55e]" />
            </div>
            <span className="text-[#6b6b8a] text-xs font-medium uppercase tracking-wider">
              Active Now
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {learners.filter((l) => l.status === "active").length}
          </p>
        </div>

        <div className="bg-gray-50 border border-[#1e1e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <span className="text-[#6b6b8a] text-xs font-medium uppercase tracking-wider">
              Total Exams
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {learners.reduce((sum, l) => sum + l.examsTaken, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 border border-[#1e1e2e] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#eab308]/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#eab308]" />
            </div>
            <span className="text-[#6b6b8a] text-xs font-medium uppercase tracking-wider">
              Certificates
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {learners
              .reduce((sum, l) => sum + l.certificatesEarned, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b8a]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50] border border-[#2a2a3e] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-[#4a4a6a] focus:outline-none focus:border-[#7c5cff] focus:ring-1 focus:ring-[#7c5cff]/30 transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-50 border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-sm text-[#6b6b8a] focus:outline-none focus:border-[#7c5cff] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-50 border shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Exams
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Certificates
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#6b6b8a] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-[#6b6b8a]">
                      <div className="w-4 h-4 border-2 border-[#7c5cff] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading learners...</span>
                    </div>
                  </td>
                </tr>
              ) : learners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#6b6b8a] text-sm">
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
                      className="hover:bg-[#1a1a28] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}
                          >
                            {getInitials(learner.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {learner.name}
                            </p>
                            <p className="text-xs text-[#6b6b8a]">
                              {learner.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${level.bg} ${level.text} border ${level.border}`}
                        >
                          {learner.skillLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9a9ab5]">
                        {learner.state}, {learner.country}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {learner.examsTaken}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {learner.certificatesEarned}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b6b8a]">
                        {learner.lastActive}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(learner.id)}
                            className="p-2 rounded-lg text-[#6b6b8a] hover:text-white hover:bg-[#2a2a3e] transition-all"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {learner.status === "active" && (
                            <>
                              <button
                                onClick={() =>
                                  handleAction(learner.id, "suspend")
                                }
                                className="p-2 rounded-lg text-[#6b6b8a] hover:text-[#eab308] hover:bg-[#eab308]/10 transition-all"
                                title="Suspend"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(learner.id, "ban")}
                                className="p-2 rounded-lg text-[#6b6b8a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {learner.status === "suspended" && (
                            <>
                              <button
                                onClick={() =>
                                  handleAction(learner.id, "unban")
                                }
                                className="p-2 rounded-lg text-[#6b6b8a] hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-all"
                                title="Restore"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(learner.id, "ban")}
                                className="p-2 rounded-lg text-[#6b6b8a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {learner.status === "banned" && (
                            <button
                              onClick={() => handleAction(learner.id, "unban")}
                              className="p-2 rounded-lg text-[#6b6b8a] hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-all"
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
        <p className="text-sm text-[#6b6b8a]">
          Showing <span className="text-white font-medium">{learners.length}</span> of{" "}
          <span className="text-white font-medium">{total.toLocaleString()}</span> learners
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-[#2a2a3e] text-[#6b6b8a] hover:text-white hover:border-[#7c5cff] hover:bg-[#7c5cff]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#7c5cff] text-white"
                    : "border border-[#2a2a3e] text-[#6b6b8a] hover:text-white hover:border-[#7c5cff] hover:bg-[#7c5cff]/10"
                }`}
              >
                {p}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="text-[#4a4a6a] px-1">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="px-3 py-2 rounded-lg border border-[#2a2a3e] text-[#6b6b8a] hover:text-white hover:border-[#7c5cff] hover:bg-[#7c5cff]/10 transition-all text-sm font-medium"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#2a2a3e] text-[#6b6b8a] hover:text-white hover:border-[#7c5cff] hover:bg-[#7c5cff]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}