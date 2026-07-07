// app/(dashboard)/certifications/page.tsx
"use client";

import Link from "next/link";
import { Award, FileCheck, Share2, Download } from "lucide-react";

// Types
interface Certificate {
  _id: string;
  title: string;
  level: string;
  date: string;
  score: number;
  scoreLabel: "Pass" | "Distinction" | "Merit";
  badgeColor: "gold" | "emerald" | "silver";
}

// Mock data — replace with your API call
const certificates: Certificate[] = [
//   {
//     _id: "cert_1",
//     title: "React Advanced Patterns",
//     level: "Professional",
//     date: "Jul 5, 2026",
//     score: 92,
//     scoreLabel: "Distinction",
//     badgeColor: "gold",
//   },
//   {
//     _id: "cert_2",
//     title: "Node.js Backend Development",
//     level: "Intermediate",
//     date: "Jun 20, 2026",
//     score: 85,
//     scoreLabel: "Pass",
//     badgeColor: "emerald",
//   },
//   {
//     _id: "cert_3",
//     title: "Data Structures & Algorithms",
//     level: "Fundamentals",
//     date: "May 12, 2026",
//     score: 78,
//     scoreLabel: "Pass",
//     badgeColor: "silver",
//   },
];

export default function CertificationsPage() {
  const hasCertificates = certificates.length > 0;

  return (
    <div className="max-w-[900px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">
            My Certifications
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            View, download, and share your earned certificates
          </p>
        </div>

        <Link
          href="/assessment"
          className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-[10px] hover:bg-slate-800 transition-colors"
        >
          <FileCheck className="w-4 h-4" />
          Take Exam
        </Link>
      </div>

      {/* Content */}
      {hasCertificates ? <CertificateList /> : <EmptyState />}
    </div>
  );
}

// ===== EMPTY STATE =====
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-[#1e1e1e] rounded-2xl border border-[#333] max-w-[400px] mx-auto">
      <h2 className="text-[22px] font-semibold text-white mb-3">
        No Certificates Yet
      </h2>
      <p className="text-[15px] text-zinc-400 leading-relaxed mb-7 max-w-[280px]">
        Complete your first course and assessment to earn your first Skillora
        Certification.
      </p>
      <Link
        href="/exam"
        className="px-7 py-3 text-[13px] font-medium text-white border-[1.5px] border-white rounded-[10px] hover:bg-white hover:text-[#1e1e1e] transition-all duration-150"
      >
        Start Learning
      </Link>
    </div>
  );
}

// ===== CERTIFICATE LIST =====
function CertificateList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((cert) => (
        <CertificateCard key={cert._id} cert={cert} />
      ))}
    </div>
  );
}

// ===== CERTIFICATE CARD =====
function CertificateCard({ cert }: { cert: Certificate }) {
  const badgeStyles = {
    gold: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700",
    emerald: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700",
    silver: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
  };

  const scoreStyles = {
    Pass: "bg-emerald-50 text-emerald-600",
    Distinction: "bg-amber-50 text-amber-700",
    Merit: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[14px] p-5 flex gap-4 hover:shadow-md transition-shadow">
      {/* Badge Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${badgeStyles[cert.badgeColor]}`}
      >
        <Award className="w-7 h-7" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
          {cert.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-2">
          <span>{cert.level}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{cert.date}</span>
        </div>

        {/* Score */}
        <div
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${scoreStyles[cert.scoreLabel]}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {cert.score}% — {cert.scoreLabel}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}