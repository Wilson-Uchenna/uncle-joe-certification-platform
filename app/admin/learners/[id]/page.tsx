"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Award,
  FileCheck,
  Activity,
  Ban,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  Loader2,
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
  joinedAt?: string;
  bio?: string;
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

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = authClient.useSession();
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const userId = params?.id as string;

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    if (userId) {
      fetchLearner();
    }
  }, [session, userId]);

  const fetchLearner = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/learners/${userId}`);
      const data = await res.json();
      if (data.success) {
        setLearner(data.learner);
      } else {
        router.push("/admin/learners");
      }
    } catch {
      router.push("/admin/learners");
    }
    setLoading(false);
  };

  const handleAction = async (action: "ban" | "unban" | "suspend") => {
    const messages: Record<string, string> = {
      ban: "Ban this user? They will lose access immediately.",
      unban: "Restore this user? They will regain full access.",
      suspend: "Suspend this user? They will be temporarily restricted.",
    };
    if (!confirm(messages[action])) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/learners/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLearner();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0B0A14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#6B668A]">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFF]" />
          <span className="text-sm">Loading learner profile...</span>
        </div>
      </div>
    );
  }

  if (!learner) return null;

  const status = STATUS_STYLES[learner.status];
  const level = LEVEL_STYLES[learner.skillLevel] || LEVEL_STYLES.Entry;
  const avatarColor = getAvatarColor(learner.name);

  return (
    <div className="w-full min-h-screen bg-[#0B0A14] text-[#E8E0FF] p-6 font-sans antialiased">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/learners")}
        className="flex items-center gap-2 text-sm text-[#6B668A] hover:text-[#E8E0FF] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Learners
      </button>

      {/* Profile Header */}
      <div className="bg-[#13121F] border border-[#1E1C2E] rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ${avatarColor} ring-2 ring-[#7C5CFF]/20`}
          >
            {getInitials(learner.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {learner.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${level.bg} ${level.text} border ${level.border}`}
              >
                {learner.skillLevel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#8B85A4]">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {learner.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {learner.state}, {learner.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last active {learner.lastActive}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {learner.status === "active" && (
              <>
                <button
                  onClick={() => handleAction("suspend")}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Suspend
                </button>
                <button
                  onClick={() => handleAction("ban")}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef4444]/10 text-[#f87171] border border-[#ef4444]/20 hover:bg-[#ef4444]/20 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  Ban
                </button>
              </>
            )}

            {learner.status === "suspended" && (
              <>
                <button
                  onClick={() => handleAction("unban")}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 hover:bg-[#22c55e]/20 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Restore
                </button>
                <button
                  onClick={() => handleAction("ban")}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef4444]/10 text-[#f87171] border border-[#ef4444]/20 hover:bg-[#ef4444]/20 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  Ban
                </button>
              </>
            )}

            {learner.status === "banned" && (
              <button
                onClick={() => handleAction("unban")}
                disabled={actionLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 hover:bg-[#22c55e]/20 transition-all text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Restore Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: FileCheck,
            label: "Exams Taken",
            value: learner.examsTaken,
            color: P.normal,
            bg: "bg-[#7C5CFF]/10",
            text: "text-[#A78BFF]",
          },
          {
            icon: Award,
            label: "Certificates",
            value: learner.certificatesEarned,
            color: "#f59e0b",
            bg: "bg-[#f59e0b]/10",
            text: "text-[#fbbf24]",
          },
          {
            icon: Activity,
            label: "Completion Rate",
            value:
              learner.examsTaken > 0
                ? `${Math.round((learner.certificatesEarned / learner.examsTaken) * 100)}%`
                : "0%",
            color: "#22c55e",
            bg: "bg-[#22c55e]/10",
            text: "text-[#4ade80]",
          },
          {
            icon: Shield,
            label: "Account Status",
            value: status.label,
            color:
              learner.status === "active"
                ? "#22c55e"
                : learner.status === "suspended"
                ? "#f59e0b"
                : "#ef4444",
            bg: status.bg,
            text: status.text,
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <div className="bg-[#13121F] border border-[#1E1C2E] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#7C5CFF]" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#1E1C2E]">
              <span className="text-sm text-[#6B668A]">User ID</span>
              <span className="text-sm text-[#E8E0FF] font-mono">{learner.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#1E1C2E]">
              <span className="text-sm text-[#6B668A]">Email</span>
              <span className="text-sm text-[#E8E0FF]">{learner.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#1E1C2E]">
              <span className="text-sm text-[#6B668A]">Skill Level</span>
              <span className="text-sm text-[#E8E0FF]">{learner.skillLevel}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#1E1C2E]">
              <span className="text-sm text-[#6B668A]">Location</span>
              <span className="text-sm text-[#E8E0FF]">
                {learner.state}, {learner.country}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#1E1C2E]">
              <span className="text-sm text-[#6B668A]">Last Active</span>
              <span className="text-sm text-[#E8E0FF]">{learner.lastActive}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-[#6B668A]">Joined</span>
              <span className="text-sm text-[#E8E0FF]">
                {learner.joinedAt || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Activity / Placeholder */}
        <div className="lg:col-span-2 bg-[#13121F] border border-[#1E1C2E] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#7C5CFF]" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {learner.examsTaken > 0 ? (
              Array.from({ length: Math.min(3, learner.examsTaken) }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#0F0E1A] border border-[#1E1C2E] hover:border-[#2A2740] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#A78BFF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Exam #{learner.examsTaken - i} completed
                    </p>
                    <p className="text-xs text-[#5A557A]">
                      {learner.lastActive}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#4ade80] bg-[#22c55e]/10 px-2.5 py-1 rounded-lg border border-[#22c55e]/20">
                    Passed
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#5A557A]">
                <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No exam activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}