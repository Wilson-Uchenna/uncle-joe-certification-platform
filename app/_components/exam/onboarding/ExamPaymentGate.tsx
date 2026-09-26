// app/_components/exam/onboarding/ExamPaymentGate.tsx
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import FlutterwaveButton from "@/app/_components/payments/PaymentsButton";
import { Loader2, Lock } from "lucide-react";

// ⚠️ Must match PRICES.exam in app/api/payment/initialize/route.ts exactly —
// this is only what's DISPLAYED on the button, the real charge is enforced server-side.
const EXAM_PRICE = 10000; // ← CHANGE THIS to the real per-attempt price

interface ExamPaymentGateProps {
  onPaymentComplete: () => void;
}

export function ExamPaymentGate({ onPaymentComplete }: ExamPaymentGateProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initPayment();
  }, []);

  async function initPayment() {
    setInitializing(true);
    setError("");
    try {
      const { data: session } = await authClient.getSession();
      if (!session?.user) return;

      setEmail(session.user.email);
      setName(session.user.name ?? "");

      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "exam" }),
      });

      if (!res.ok) throw new Error("Could not start payment. Please refresh.");
      const data = await res.json();
      setReference(data.reference);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setInitializing(false);
    }
  }

  async function handleSuccess(payment: {
    status: string;
    transaction_id: number;
    tx_ref: string;
    amount: number;
    currency: string;
  }) {
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
        setError(data?.error || data?.message || "Payment verification failed. Please try again.");
        return;
      }

      onPaymentComplete();
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setError("Could not confirm payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl p-8 border border-[#e9e4f0] text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[#1e1b4b] mb-2">Pay to start your exam</h1>
        <p className="text-sm text-slate-500 mb-6">
          Each exam attempt requires a one-time payment of ₦{EXAM_PRICE.toLocaleString()}. Once paid, you'll pick your category and role next.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {initializing || !reference ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-600" />
        ) : verifying ? (
          <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-medium">
            Confirming payment…
          </button>
        ) : (
          <FlutterwaveButton
            email={email}
            name={name}
            amount={EXAM_PRICE}
            reference={reference}
            metadata={{ type: "exam" }}
            onSuccess={handleSuccess}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
          />
        )}
      </div>
    </div>
  );
}