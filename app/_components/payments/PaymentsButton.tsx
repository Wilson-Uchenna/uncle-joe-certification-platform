"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window {
    FlutterwaveCheckout: any;
    closePaymentModal: any;
  }
}
interface FlutterwaveResponse {
  status: string;
  transaction_id: number;
  tx_ref: string;
  amount: number;
  currency: string;
}

interface FlutterwaveButtonProps {
  email: string;
  name: string; // Flutterwave requires customer.name
  amount: number; // in NGN (main unit — Flutterwave does NOT need kobo conversion)
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (response: FlutterwaveResponse) => void;
  onCancel?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function FlutterwaveButton({
  email,
  name,
  amount,
  reference,
  metadata = {},
  onSuccess,
  onCancel,
  className = "",
  children,
}: FlutterwaveButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Flutterwave inline script
    if (document.getElementById("flutterwave-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "flutterwave-script";
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove on unmount — shared across components
    };
  }, []);

  const handlePay = () => {
    if (!window.FlutterwaveCheckout) {
      alert("Payment system loading... please try again.");
      return;
    }

    const params = {
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
      tx_ref: reference,
      amount,
      currency: "NGN",
      customer: { email, name },
      meta: metadata,
      callback: (response: any) => {
        onSuccess({
          status: response.status,
          transaction_id: response.transaction_id,
          tx_ref: response.tx_ref,
          amount: response.amount,
          currency: response.currency,
        });
        if (window.closePaymentModal) {
          window.closePaymentModal();
        }
      },
    };
    console.log("Flutterwave params:", params); // TEMP — check this in console

    window.FlutterwaveCheckout(params);
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
