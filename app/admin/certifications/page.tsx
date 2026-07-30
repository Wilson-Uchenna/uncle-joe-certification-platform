"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

/**
 * Primaryc color ramp (from the Figma "Styles" panel).
 * Swap the hex values below if the design tokens change —
 * every color in this file is driven from this one object.
 */
const primaryc = {
  light: "#E8E9FC",
  lightHover: "#DBDDFA",
  lightActive: "#C7CAF7",
  normal: "#5558CB",
  normalHover: "#4548B5",
  normalActive: "#3A3D9C",
  dark: "#2E3080",
  darkHover: "#26276A",
  darkActive: "#1D1E52",
  darker: "#14153B",
};

type Certificate = {
  id: string;
  userName: string;
  email: string;
  categoryName: string;
  score: number;
  issuedAt: string;
  verificationCode: string;
  status: "pending" | "approved" | "rejected";
};

export default function CertificationManagement() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchCertificates();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, filter]);

  const fetchCertificates = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/certificates?status=${filter}`);
    const data = await res.json();
    if (data.success) {
      setCertificates(data.certificates);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const res = await fetch("/api/admin/certificates/stats");
    const data = await res.json();
    if (data.success) setStats(data.stats);
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/certificates/${id}/approve`, { method: "POST" });
    fetchCertificates();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/certificates/${id}/reject`, { method: "POST" });
    fetchCertificates();
  };

  const handleDownload = async (certId: string, userName: string) => {
    const res = await fetch(`/api/admin/certificates/${certId}/download`);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to download");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${userName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const statusStyles: Record<Certificate["status"], string> = {
    approved: "text-white",
    pending: "text-white",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
        Certification Management
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">
        Generate, approve, and verify certifications.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Total Issued" value={stats.total} icon={Award} />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={CheckCircle}
        />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={
              filter === f
                ? { backgroundColor: primaryc.normal, color: "#fff" }
                : { backgroundColor: primaryc.light, color: primaryc.darker }
            }
            className="px-3 sm:px-4 py-2 rounded-lg capitalize text-sm sm:text-base transition-colors"
            onMouseEnter={(e) => {
              if (filter !== f)
                e.currentTarget.style.backgroundColor = primaryc.lightHover;
            }}
            onMouseLeave={(e) => {
              if (filter !== f)
                e.currentTarget.style.backgroundColor = primaryc.light;
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead style={{ backgroundColor: primaryc.light }}>
            <tr>
              {["Learner", "Category", "Score", "Verification Code", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 lg:px-6 py-3 text-left text-sm font-medium"
                    style={{ color: primaryc.darker }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No certificates found.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr
                  key={cert.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {cert.userName}
                    </p>
                    <p className="text-sm text-gray-500">{cert.email}</p>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                    {cert.categoryName}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {cert.score}%
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <code
                      className="px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: primaryc.light, color: primaryc.darker }}
                    >
                      {cert.verificationCode}
                    </code>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <StatusBadge status={cert.status} />
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <RowActions
                      cert={cert}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDownload={handleDownload}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500 bg-white border rounded-xl">
            Loading...
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white border rounded-xl">
            No certificates found.
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{cert.userName}</p>
                  <p className="text-sm text-gray-500">{cert.email}</p>
                </div>
                <StatusBadge status={cert.status} />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Category: </span>
                  <span className="text-gray-900">{cert.categoryName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Score: </span>
                  <span className="font-medium text-gray-900">
                    {cert.score}%
                  </span>
                </div>
              </div>

              <code
                className="self-start px-2 py-1 rounded text-xs"
                style={{ backgroundColor: primaryc.light, color: primaryc.darker }}
              >
                {cert.verificationCode}
              </code>

              <div className="flex gap-2 pt-1 border-t">
                <RowActions
                  cert={cert}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Certificate["status"] }) {
  const style =
    status === "approved"
      ? { backgroundColor: primaryc.normal, color: "#fff" }
      : status === "pending"
        ? { backgroundColor: primaryc.light, color: primaryc.darker }
        : { backgroundColor: "#FEE2E2", color: "#B91C1C" };

  return (
    <span
      className="px-2 py-1 rounded text-sm inline-block capitalize"
      style={style}
    >
      {status}
    </span>
  );
}

function RowActions({
  cert,
  onApprove,
  onReject,
  onDownload,
}: {
  cert: Certificate;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDownload: (id: string, userName: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {cert.status === "pending" && (
        <>
          <button
            onClick={() => onApprove(cert.id)}
            className="p-1 rounded hover:opacity-80"
            style={{ backgroundColor: primaryc.light }}
            aria-label="Approve certificate"
          >
            <CheckCircle
              className="w-4 h-4"
              style={{ color: primaryc.normal }}
            />
          </button>
          <button
            onClick={() => onReject(cert.id)}
            className="p-1 hover:bg-red-50 rounded"
            aria-label="Reject certificate"
          >
            <XCircle className="w-4 h-4 text-red-600" />
          </button>
        </>
      )}
      <button
        onClick={() => onDownload(cert.id, cert.userName)}
        className="p-1 hover:bg-gray-50 rounded"
        title="Download PDF"
        aria-label="Download certificate PDF"
      >
        <Download className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: primaryc.light }}
        >
          <Icon className="w-4 h-4" style={{ color: primaryc.normal }} />
        </div>
        <span className="text-xs sm:text-sm text-gray-500 leading-tight">
          {title}
        </span>
      </div>
      <p
        className="text-xl sm:text-2xl font-bold"
        style={{ color: primaryc.darker }}
      >
        {value}
      </p>
    </div>
  );
}