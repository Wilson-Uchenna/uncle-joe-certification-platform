"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Award,
  Download,
  Lock,
  CheckCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import PaystackButton from "@/app/_components/payments/PaymentsButton";

type ExamResult = {
  _id: string;
  examId: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  passed: boolean;
  certificatePaidAt?: string;
  certificateDownloaded: boolean;
  createdAt: string;
};

export default function CertificatesPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetchResults();
  }, [session]);

  const fetchResults = async () => {
    const res = await fetch("/api/exam/results?passed=true");
    const data = await res.json();
    if (data.success) setResults(data.results);
    setLoading(false);
  };

  const handlePaymentSuccess = async (reference: string) => {
    setVerifying(reference);
    try {
      // Verify on backend
      const res = await fetch(`/api/payment/verify?ref=${reference}`);
      const data = await res.json();

      if (data.success) {
        alert("Payment successful! Your certificate is ready.");
        fetchResults(); // Refresh to show download button
      } else {
        alert(data.message || "Payment verification failed. Contact support.");
      }
    } finally {
      setVerifying(null);
    }
  };

  const handleDownload = (certId: string) => {
    window.open(`/api/certificates/${certId}/download`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
      <p className="text-gray-500 mb-8">
        Download your earned certificates and unlock new ones.
      </p>

      {results.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
          <p className="text-gray-500 mt-1">Complete an exam to earn your first certificate.</p>
          <button
            onClick={() => router.push("/assessment")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Take an Exam
          </button>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => {
          const isPaid = !!result.certificatePaidAt;
          const canDownload = isPaid && result.passed;

          return (
            <div
              key={result._id}
              className="bg-white border rounded-xl p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    canDownload ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {canDownload ? (
                    <Award className="w-6 h-6 text-green-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{result.categoryName}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {result.skillLevel} Level • {result.score}% Score
                  </p>
                  {isPaid && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  )}
                </div>
              </div>

              <div>
                {canDownload ? (
                  <button
                    onClick={() => handleDownload(result._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                ) : (
                  <>
                    {verifying === result._id ? (
                      <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </button>
                    ) : (
                      <PaystackButton
                        email={session!.user!.email!}
                        amount={5000}
                        reference={`CERT-${result.examId}-${Date.now()}`}
                        metadata={{
                          examId: result.examId,
                          userId: session!.user!.id,
                        }}
                        onSuccess={handlePaymentSuccess}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay ₦5,000
                      </PaystackButton>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}