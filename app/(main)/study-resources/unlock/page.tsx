// app/study-resources/unlock/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FlutterwaveButton from "@/app/_components/payments/PaymentsButton";

import { authClient } from "@/lib/auth-client";

const LABELS: Record<string, { title: string; amount: number }> = {
  pdf_materials: { title: "explanations", amount: 2000 },
  past_questions: { title: "past questions", amount: 1000 },
};

function UnlockInner() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type") ?? "pdf_materials";
  const info = LABELS[type] ?? LABELS.pdf_materials;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [txRef, setTxRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      const { data } = await authClient.getSession();
      const user = data?.user;

      if (!user?.email) {
        setError("Could not load your account details. Please refresh.");
        return;
      }

      setEmail(user.email);
      setName(user.name ?? "");

      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.status === 409) {
        router.push("/study-resources");
        return;
      }
      if (!res.ok) {
        setError("Could not start payment. Please refresh and try again.");
        return;
      }
      const data2 = await res.json();
      setTxRef(data2.reference);
    }
    initPayment();
  }, [type]);

  async function handleSuccess(payment: {
    status: string;
    transaction_id: number;
    tx_ref: string;
    amount: number;
    currency: string;
  }) {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: payment.tx_ref,
          transactionId: payment.transaction_id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data?.error ||
            data?.message ||
            "Payment verification failed. Please try again.",
        );
        return;
      }

      router.push("/study-resources");
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setError("Could not confirm payment. Please try again.");
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-[480px] bg-white rounded-xl p-8 border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock {info.title}
        </h1>
        <p className="text-gray-600 mb-6">Get full access to {info.title}.</p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!txRef || !email ? (
          <Loader2 />
        ) : (
          <FlutterwaveButton
            email={email}
            name={name}
            amount={info.amount}
            reference={txRef}
            metadata={{ type }}
            onSuccess={handleSuccess}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
          />
        )}
      </div>
    </main>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
      <UnlockInner />
    </Suspense>
  );
}
