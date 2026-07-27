"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Search,
  CheckCircle,
  XCircle,
  Download,
  Eye,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Certification Management
      </h1>
      <p className="text-gray-500 mb-6">
        Generate, approve, and verify certifications.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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
      <div className="flex gap-4 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Learner
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Score
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Verification Code
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{cert.userName}</p>
                    <p className="text-sm text-gray-500">{cert.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cert.categoryName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {cert.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {cert.verificationCode}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        cert.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : cert.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {cert.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(cert.id)}
                            className="p-1 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(cert.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDownload(cert.id, cert.userName)}
                        className="p-1 hover:bg-gray-50 rounded"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
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

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-indigo-600" />
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
