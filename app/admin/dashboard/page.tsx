"use client";

import { useEffect, useState } from "react";
import {  useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Analytics = {
  totalRegistrations: number;
  totalExamsTaken: number;
  examCompletionRate: number;
  certificateDownloadRate: number;
  revenueGenerated: number;
  conversionFunnel: {
    registered: number;
    startedExam: number;
    completedExam: number;
    viewedResult: number;
    paidForCertificate: number;
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch analytics
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data.analytics);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, sessionLoading, router]);

  // Show loading while checking session
  if (sessionLoading || loading || !analytics) {
    
    return (
      <div className="min-h-screen w-full mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }
  

  // Should not reach here if not admin (redirected above)
  if (!session?.user) return null;

  const funnel = analytics?.conversionFunnel;

  return (
    <div className="flex h-screen bg-gray-50 w-full justify-between gap-[4rem] items-start">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-2 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dashboard Home
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your command center for managing learners, certifications, and
                platform performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 font-bold">
                  {session.user.name?.charAt(0) || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <div className="px-8 py-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">
              Welcome Administrator
            </h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Welcome to the Uncle Joe Certification Admin Dashboard. Manage
              learners, track certifications, and monitor platform performance.
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Registrations"
              value={analytics?.totalRegistrations || 0}
              icon={Users}
              trend="up"
              color="blue"
            />
            <StatCard
              title="Exams Taken"
              value={analytics?.totalExamsTaken || 0}
              icon={ClipboardCheck}
              trend="up"
              color="green"
            />
            <StatCard
              title="Completion Rate"
              value={`${analytics?.examCompletionRate || 0}%`}
              icon={CheckCircle}
              trend={(analytics?.examCompletionRate ?? 0) > 50 ? "up" : "down"}
              color="purple"
            />
            <StatCard
              title="Revenue Generated"
              value={`₦${(analytics?.revenueGenerated || 0).toLocaleString()}`}
              icon={TrendingUp}
              trend="up"
              color="orange"
            />
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Funnel
            </h3>
            <div className="space-y-4">
              {funnel && (
                <>
                  <FunnelStep
                    label="Registered Users"
                    value={funnel.registered}
                    total={funnel.registered}
                    color="bg-blue-500"
                  />
                  <FunnelStep
                    label="Started Exam"
                    value={funnel.startedExam}
                    total={funnel.registered}
                    color="bg-indigo-500"
                  />
                  <FunnelStep
                    label="Completed Exam"
                    value={funnel.completedExam}
                    total={funnel.registered}
                    color="bg-purple-500"
                  />
                  <FunnelStep
                    label="Viewed Result"
                    value={funnel.viewedResult}
                    total={funnel.registered}
                    color="bg-pink-500"
                  />
                  <FunnelStep
                    label="Paid for Certificate"
                    value={funnel.paidForCertificate}
                    total={funnel.registered}
                    color="bg-green-500"
                  />
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Manage Courses"
              description="Create, edit, organize, and publish courses."
              icon={BookOpen}
              href="/admin/courses"
              color="bg-blue-50 text-blue-700"
            />
            <QuickActionCard
              title="Issue Certificates"
              description="Generate, approve, and manage certifications."
              icon={Award}
              href="/admin/certifications"
              color="bg-purple-50 text-purple-700"
            />
            <QuickActionCard
              title="View Reports"
              description="Access platform insights and performance metrics."
              icon={BarChart3}
              href="/admin/reports"
              color="bg-green-50 text-green-700"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function FunnelStep({ label, value, total, color }: any) {
  const safeValue = value ?? 0;
  const rawPercentage = total > 0 ? Math.round((safeValue / total) * 100) : 0;
  const displayPercentage = Math.min(rawPercentage, 100); // clamp bar width only

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {safeValue.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color} transition-all`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{rawPercentage}% of total</p>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, href, color }: any) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}
