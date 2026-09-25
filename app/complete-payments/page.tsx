"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FlutterwaveButton from "@/app/_components/payments/PaymentsButton";

const REGISTRATION_FEE = 10000; // adjust to your actual fee

function CompletePaymentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const name = params.get("name") ?? "";

  const [txRef, setTxRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        router.push("/role-onboarding");
        return;
      }

      if (!res.ok) {
        setError("Could not start payment. Please refresh and try again.");
        return;
      }
      const data = await res.json();
      setTxRef(data.reference);
    }
    if (email) initPayment();
  }, [email]);

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
      headers: {
        "Content-Type": "application/json",
      },
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

    router.push("/role-onboarding");
  } catch (error) {
    console.error("Payment confirmation error:", error);
    setError("Could not confirm payment. Please try again.");
  }
}
  return (
    <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-[480px] bg-white rounded-xl p-8 border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Registration
        </h1>
        <p className="text-gray-600 mb-6">
          One last step — a one-time registration fee unlocks your full account
          access.
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!txRef ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
        ) : (
          <FlutterwaveButton
            email={email}
            name={name}
            amount={REGISTRATION_FEE}
            reference={txRef}
            onSuccess={handleSuccess}
            onCancel={() => {}}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
          />
        )}
      </div>
    </main>
  );
}

export default function CompletePaymentPage() {
  return (
    <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
      <CompletePaymentInner />
    </Suspense>
  );
}
