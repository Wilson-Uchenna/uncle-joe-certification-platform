"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackButtonProps {
  email: string;
  amount: number; // in NGN (main unit)
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function PaystackButton({
  email,
  amount,
  reference,
  metadata = {},
  onSuccess,
  onCancel,
  className = "",
  children,
}: PaystackButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack inline script
    if (document.getElementById("paystack-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove on unmount — shared across components
    };
  }, []);

  const handlePay = () => {
    if (!window.PaystackPop) {
      alert("Payment system loading... please try again.");
      return;
    }

    const popup = new window.PaystackPop();
    popup.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email,
      amount: amount * 100, // kobo
      reference,
      metadata,
      onSuccess: (transaction: any) => {
        onSuccess(transaction.reference);
      },
      onCancel: () => {
        onCancel?.();
      },
    });
  };

  return (
    <button
      onClick={handlePay}
      disabled={!scriptLoaded}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {!scriptLoaded ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children || (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ₦{amount.toLocaleString()}
          </>
        )
      )}
    </button>
  );
}