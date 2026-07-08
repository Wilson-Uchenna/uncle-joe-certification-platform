"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, TrendingUp, Users, Clock, BookOpen, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ReportData = {
  overview: {
    totalExams: number;
    completedExams: number;
    passRate: number;
    avgScore: number;
    avgTimeMinutes: number;
  };
  participation: { _id: string; count: number }[];
  topPerformers: {
    userId: string;
    userName: string;
    score: number;
    timeUsed: number;
    category: string;
    passed: boolean;
  }[];
  questionBank: {
    total: number;
    active: number;
    finalStage: number;
    avgDifficulty: number;
  };
  roleBreakdown: { role: string; count: number }[];
};

export default function AssessmentReport() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchReport();
  }, [session, days]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/assessments/report?days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "Unable to load report");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { overview, participation, topPerformers, questionBank, roleBreakdown } = report;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/assessment")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Report</h1>
          <p className="text-gray-500">Review participation, pass rates, and learning outcomes</p>
        </div>
      </div>

      {/* Time Filter */}
      <div className="mb-8">
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Exams"
          value={overview.totalExams}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          label="Pass Rate"
          value={`${overview.passRate}%`}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
          label="Avg Score"
          value={`${overview.avgScore}%`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          label="Avg Time"
          value={`${overview.avgTimeMinutes}m`}
        />
      </div>

      {/* Question Bank Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Bank</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{questionBank.total}</p>
            <p className="text-sm text-gray-500">Total Questions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{questionBank.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{questionBank.finalStage}</p>
            <p className="text-sm text-gray-500">Final Stage</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{questionBank.avgDifficulty.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Difficulty</p>
          </div>
        </div>
      </div>

            {/* Role Breakdown */}
      {report.roleBreakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions by Sub-Role</h2>
          <div className="space-y-3">
            {report.roleBreakdown.map((r) => (
              <div key={r.role} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{r.role}</span>
                    <span className="text-gray-500">{r.count} questions</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(r.count / Math.max(...report.roleBreakdown.map((x) => x.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participation Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Participation Trend</h2>
        {participation.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {participation.map((day) => (
              <div
                key={day._id}
                className="flex-1 bg-indigo-100 hover:bg-indigo-200 rounded-t transition-colors relative group"
                style={{ height: `${Math.max((day.count / Math.max(...participation.map((d) => d.count))) * 100, 5)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day._id}: {day.count} exams
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{participation[0]?._id}</span>
          <span>{participation[participation.length - 1]?._id}</span>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topPerformers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  No completed exams yet
                </td>
              </tr>
            ) : (
              topPerformers.map((p, i) => (
                <tr key={p.userId + i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.score}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.timeUsed}m</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}