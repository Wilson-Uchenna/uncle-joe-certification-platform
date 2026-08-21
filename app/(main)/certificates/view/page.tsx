"use client";

import { useSearchParams } from "next/navigation";
import SkilloraCertificatePayment from "@/app/_components/payments/skillora-payments";

export default function CertificatePaymentPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const score = searchParams.get("score");
  

  if (!examId || !score) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>
          Missing exam information. Please try again from your results page.
        </p>
      </div>
    );
  }

  return <SkilloraCertificatePayment examId={examId} score={Number(score)} />;
}
