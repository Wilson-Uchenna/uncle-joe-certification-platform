// components/StudyResourcesTabs.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import FlutterwaveButton from "@/app/_components/payments/PaymentsButton";
import { Loader2, Lock, FileText } from "lucide-react";

interface Resource {
  _id: string;
  title: string;
  fileSize?: number;
  categoryName: string;
  skillLevel: string;
  hasAccess: boolean;
}

const EXPLANATION_PRICE = 2000;
const PAST_QUESTION_PRICE = 1000;

export function StudyResourcesTabs({
  explanations: initialExplanations,
  pastQuestions: initialPastQuestions,
}: {
  explanations: Resource[];
  pastQuestions: Resource[];
}) {
  const [tab, setTab] = useState<"explanations" | "past-questions">("explanations");
  const [explanations, setExplanations] = useState(initialExplanations);
  const [pastQuestions, setPastQuestions] = useState(initialPastQuestions);

  const groupedExplanations = explanations.reduce<Record<string, Resource[]>>((acc, e) => {
    (acc[e.categoryName] ??= []).push(e);
    return acc;
  }, {});

  const groupedPastQuestions = pastQuestions.reduce<Record<string, Resource[]>>((acc, p) => {
    (acc[p.categoryName] ??= []).push(p);
    return acc;
  }, {});

  function markUnlocked(setter: typeof setExplanations, id: string) {
    setter((prev) => prev.map((r) => (r._id === id ? { ...r, hasAccess: true } : r)));
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Study resources</h1>
        <p style={{ color: "#666", margin: 0 }}>Pay per item — no bundle required.</p>
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
          Explanations
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
          Past questions
        </button>
      </div>

      {tab === "explanations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(groupedExplanations).map(([categoryName, items]) => (
            <div key={categoryName}>
              <h3 style={{ marginBottom: 8 }}>{categoryName}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {items.map((item) => (
                  <ResourceCard
                    key={item._id}
                    item={item}
                    resourceType="explanation"
                    price={EXPLANATION_PRICE}
                    downloadEndpoint={`/api/study-resources/explanations/${item._id}`}
                    onUnlocked={() => markUnlocked(setExplanations, item._id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {explanations.length === 0 && <p style={{ color: "#999" }}>No explanations published yet.</p>}
        </div>
      )}

      {tab === "past-questions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(groupedPastQuestions).map(([categoryName, items]) => (
            <div key={categoryName}>
              <h3 style={{ marginBottom: 8 }}>{categoryName}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {items.map((item) => (
                  <ResourceCard
                    key={item._id}
                    item={item}
                    resourceType="past_question"
                    price={PAST_QUESTION_PRICE}
                    downloadEndpoint={`/api/study-resources/past-questions/${item._id}`}
                    onUnlocked={() => markUnlocked(setPastQuestions, item._id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {pastQuestions.length === 0 && <p style={{ color: "#999" }}>No past questions published yet.</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Shared inline unlock flow — initializes a payment for one specific
 * resource, renders the Flutterwave button, verifies on success, then
 * tells the parent to flip that one item to unlocked.
 */
function useInlineUnlock({
  type,
  metadata,
  onUnlocked,
}: {
  type: "explanation" | "past_question";
  metadata: Record<string, string>;
  onUnlocked: () => void;
}) {
  const { data: session } = authClient.useSession();
  const [unlocking, setUnlocking] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  async function startUnlock() {
    setUnlocking(true);
    setError("");
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, metadata }),
      });
      if (!res.ok) throw new Error("Could not start payment.");
      const data = await res.json();
      setReference(data.reference);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setUnlocking(false);
    }
  }

  async function handleSuccess(payment: { tx_ref: string; transaction_id: number }) {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: payment.tx_ref, transactionId: payment.transaction_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || data?.message || "Verification failed.");
      }
      onUnlocked();
    } catch (err: any) {
      setError(err.message || "Could not confirm payment.");
    } finally {
      setVerifying(false);
      setUnlocking(false);
      setReference(null);
    }
  }

  return { session, unlocking, reference, verifying, error, startUnlock, handleSuccess };
}

function ResourceCard({
  item,
  resourceType,
  price,
  downloadEndpoint,
  onUnlocked,
}: {
  item: Resource;
  resourceType: "explanation" | "past_question";
  price: number;
  downloadEndpoint: string;
  onUnlocked: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const metadataKey = resourceType === "explanation" ? "explanationId" : "pastQuestionId";
  const unlock = useInlineUnlock({
    type: resourceType,
    metadata: { [metadataKey]: item._id },
    onUnlocked,
  });

  async function openPdf() {
    setOpening(true);
    try {
      const res = await fetch(downloadEndpoint);
      if (!res.ok) throw new Error("Failed to get file");
      const { url, fileName } = await res.json();

      const fileRes = await fetch(url);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "resource.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Couldn't open this file — try again.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div
      style={{
        textAlign: "left",
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: item.hasAccess ? "#fff" : "#fafafa",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <FileText size={18} color={item.hasAccess ? "#4f46e5" : "#999"} />
        {!item.hasAccess && <Lock size={14} color="#999" />}
      </div>
      <div style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</div>
      {item.fileSize && (
        <div style={{ fontSize: 12, color: "#999" }}>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</div>
      )}

      {unlock.error && <p style={{ fontSize: 12, color: "#c62828" }}>{unlock.error}</p>}

      {item.hasAccess ? (
        <button onClick={openPdf} disabled={opening} style={{ marginTop: 4 }}>
          {opening ? "Opening…" : "Open PDF"}
        </button>
      ) : !unlock.unlocking ? (
        <button onClick={unlock.startUnlock} style={{ marginTop: 4 }}>
          Pay ₦{price.toLocaleString()}
        </button>
      ) : unlock.verifying ? (
        <button disabled style={{ marginTop: 4 }}>
          <Loader2 size={14} className="animate-spin" /> Confirming…
        </button>
      ) : !unlock.reference ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FlutterwaveButton
          email={unlock.session?.user?.email ?? ""}
          name={unlock.session?.user?.name ?? ""}
          amount={price}
          reference={unlock.reference}
          metadata={{ type: resourceType, [metadataKey]: item._id }}
          onSuccess={unlock.handleSuccess}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm"
        />
      )}
    </div>
  );
}