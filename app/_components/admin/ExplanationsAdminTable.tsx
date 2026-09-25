// components/admin/ExplanationsAdminTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface Resource {
  _id: string;
  title: string;
  categoryName: string;
  skillLevel: string;
  fileSize?: number;
  isPublished: boolean;
  createdAt: string;
}

export function ExplanationsAdminTable({ resources: initial }: { resources: Resource[] }) {
  const [resources, setResources] = useState(initial);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    if (filter === "published") return r.isPublished;
    if (filter === "draft") return !r.isPublished;
    return true;
  });

  const draftCount = resources.filter((r) => !r.isPublished).length;
  const publishedCount = resources.filter((r) => r.isPublished).length;

  async function togglePublish(id: string, current: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/study-resources/explanations/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) throw new Error();
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isPublished: !current } : r))
      );
    } catch {
      alert("Couldn't update — try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/study-resources/explanations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Couldn't delete — try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Explanations</h1>
        <Link href="/admin/study-resources/explanations/new">
          <button>+ New explanation</button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
        <FilterTab label={`All (${resources.length})`} active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterTab label={`Published (${publishedCount})`} active={filter === "published"} onClick={() => setFilter("published")} />
        <FilterTab label={`Drafts (${draftCount})`} active={filter === "draft"} onClick={() => setFilter("draft")} />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd", fontSize: 13, color: "#666" }}>
            <th style={{ padding: "8px 4px" }}>Title</th>
            <th style={{ padding: "8px 4px" }}>Category</th>
            <th style={{ padding: "8px 4px" }}>Level</th>
            <th style={{ padding: "8px 4px" }}>Size</th>
            <th style={{ padding: "8px 4px" }}>Status</th>
            <th style={{ padding: "8px 4px" }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px 4px", fontWeight: 500 }}>{r.title}</td>
              <td style={{ padding: "10px 4px" }}>{r.categoryName}</td>
              <td style={{ padding: "10px 4px" }}>{r.skillLevel}</td>
              <td style={{ padding: "10px 4px" }}>
                {r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(1)} MB` : "—"}
              </td>
              <td style={{ padding: "10px 4px" }}>
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: r.isPublished ? "#e6f4ea" : "#f5f5f5",
                    color: r.isPublished ? "#1e7e34" : "#888",
                  }}
                >
                  {r.isPublished ? "Published" : "Draft"}
                </span>
              </td>
              <td style={{ padding: "10px 4px", display: "flex", gap: 8 }}>
                <button
                  onClick={() => togglePublish(r._id, r.isPublished)}
                  disabled={busyId === r._id}
                  style={{ fontSize: 12 }}
                >
                  {r.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={busyId === r._id}
                  style={{ fontSize: 12, color: "#c62828" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#999" }}>
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 4px",
        fontWeight: active ? 600 : 400,
        borderBottom: active ? "2px solid #4f46e5" : "2px solid transparent",
        background: "none",
      }}
    >
      {label}
    </button>
  );
}