// components/StudyResourcesTabs.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface Explanation {
  _id: string;
  title: string;
  fileSize?: number;
  categoryName: string;
  skillLevel: string;
}

interface FailedExam {
  _id: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}

export function StudyResourcesTabs({
  hasPdfAccess,
  hasPastQuestionsAccess,
  explanations,
  failedExams,
}: {
  hasPdfAccess: boolean;
  hasPastQuestionsAccess: boolean;
  explanations: Explanation[];
  failedExams: FailedExam[];
}) {
  const [tab, setTab] = useState<"explanations" | "past-questions">("explanations");

  const grouped = explanations.reduce<Record<string, Explanation[]>>((acc, e) => {
    (acc[e.categoryName] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Study resources</h1>
        <p style={{ color: "#666", margin: 0 }}>Explanations and past questions</p>
      </div>

      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #ddd", marginBottom: 20 }}>
        <button
          onClick={() => setTab("explanations")}
          style={{
            padding: "8px 4px",
            fontWeight: tab === "explanations" ? 600 : 400,
            borderBottom: tab === "explanations" ? "2px solid #4f46e5" : "2px solid transparent",
            background: "none",
          }}
        >
          Explanations {!hasPdfAccess && "🔒"}
        </button>
        <button
          onClick={() => setTab("past-questions")}
          style={{
            padding: "8px 4px",
            fontWeight: tab === "past-questions" ? 600 : 400,
            borderBottom: tab === "past-questions" ? "2px solid #4f46e5" : "2px solid transparent",
            background: "none",
          }}
        >
          Past questions {!hasPastQuestionsAccess && "🔒"}
        </button>
      </div>

      {tab === "explanations" && (
        <div>
          {!hasPdfAccess && <UnlockBanner type="pdf_materials" price="₦2,000" label="explanations" />}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
            {Object.entries(grouped).map(([categoryName, items]) => (
              <div key={categoryName}>
                <h3 style={{ marginBottom: 8 }}>{categoryName}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {items.map((item) => (
                    <ExplanationCard key={item._id} item={item} locked={!hasPdfAccess} />
                  ))}
                </div>
              </div>
            ))}
            {explanations.length === 0 && <p style={{ color: "#999" }}>No explanations published yet.</p>}
          </div>
        </div>
      )}

      {tab === "past-questions" && (
        <div>
          {!hasPastQuestionsAccess ? (
            <UnlockBanner type="past_questions" price="₦1,000" label="past questions" />
          ) : failedExams.length === 0 ? (
            <p style={{ color: "#999" }}>No failed attempts yet — this fills in after a failed exam.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {failedExams.map((exam) => (
                <Link
                  key={exam._id}
                  href={`/study-resources/past-questions/${exam._id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 16,
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {exam.categoryName} — {exam.skillLevel}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      {new Date(exam.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {exam.correctCount}/{exam.totalQuestions} ({exam.score}%)
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UnlockBanner({
  type,
  price,
  label,
}: {
  type: "pdf_materials" | "past_questions";
  price: string;
  label: string;
}) {
  return (
    <Link href={`/study-resources/unlock?type=${type}`}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          background: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: 10,
        }}
      >
        <span>🔒 Unlock {label}</span>
        <button>{price}</button>
      </div>
    </Link>
  );
}

function ExplanationCard({ item, locked }: { item: Explanation; locked: boolean }) {
  const [loading, setLoading] = useState(false);

  async function openPdf() {
    if (locked) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/study-resources/explanations/${item._id}`);
      if (!res.ok) throw new Error("Failed to get file");
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      alert("Couldn't open this file — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPdf}
      disabled={locked || loading}
      style={{
        textAlign: "left",
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: locked ? "#fafafa" : "#fff",
        cursor: locked ? "default" : "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>📄</span>
        {locked && <span>🔒</span>}
      </div>
      <div style={{ fontWeight: 500, fontSize: 14, marginTop: 8 }}>{item.title}</div>
      {item.fileSize && (
        <div style={{ fontSize: 12, color: "#999" }}>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</div>
      )}
      {loading && <div style={{ fontSize: 12, color: "#999" }}>Opening…</div>}
    </button>
  );
}