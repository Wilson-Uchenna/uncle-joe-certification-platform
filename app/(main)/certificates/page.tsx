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
  Plus,
  FileText,
  InfoIcon,
  X,
} from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import PaystackButton from "@/app/_components/payments/PaymentsButton";

type ExamResult = {
  _id: string;
  examId: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  passed: boolean;
  resultsPaidAt?: string;
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
  const [retakeBlocked, setRetakeBlocked] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState<string | null>(null);

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

  const handleTakeExam = async () => {
    try {
      const res = await fetch("/api/exam/results?latest=true");
      const data = await res.json();

      if (!data.success) {
        setRetakeMessage(data.error || "Unable to check exam status.");
        setRetakeBlocked(true);
        return;
      }

      const latestResult = data.result;

      // No previous exam
      if (!latestResult) {
        router.push("/assessment");
        return;
      }

      const resultsAvailableAt = new Date(
        latestResult.resultsAvailableAt,
      ).getTime();

      // Results are still under embargo
      if (Date.now() < resultsAvailableAt) {
        const remainingMs = resultsAvailableAt - Date.now();

        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

        setRetakeMessage(
          `You cannot retake the exam yet. Please wait ${remainingMinutes} minute${
            remainingMinutes !== 1 ? "s" : ""
          } before trying again.`,
        );

        setRetakeBlocked(true);
        return;
      }

      // Embargo expired
      router.push("/assessment");
    } catch (error) {
      console.error("Retake check failed:", error);

      setRetakeMessage("Unable to check your exam status. Please try again.");
      setRetakeBlocked(true);
    }
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

  const handleViewCertificate = (examId: string) => {
    router.push(`/certificates/view?examId=${examId}`);
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
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Certificates
          </h1>
          <p className="text-gray-500">
            Download your earned certificates and unlock new ones.
          </p>
        </div>
        <button
          onClick={handleTakeExam}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Take Exam
        </button>
      </div>

      {/* Retake warning appears here */}
      {retakeMessage && (
        <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-amber-600" />

            <div className="flex-1 pr-6">
              <AlertTitle className="mb-1 text-sm font-semibold text-amber-900">
                Retake not available
              </AlertTitle>

              <AlertDescription className="text-sm leading-6 text-amber-800">
                {retakeMessage}
              </AlertDescription>
            </div>

            <button
              type="button"
              onClick={() => setRetakeMessage(null)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-900"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      )}

      {results.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No certificates yet
          </h3>
          <p className="text-gray-500 mt-1">
            Complete an exam to earn your first certificate.
          </p>
          <button
            onClick={handleTakeExam}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Take an Exam
          </button>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => {
          const isPaid = !!result.resultsPaidAt;
          const canDownload = isPaid && result.passed;

          return (
            <div
              key={result._id}
              className="bg-white border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                  <h3 className="font-medium text-gray-900">
                    {result.categoryName}
                  </h3>
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

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/results/${result.examId}`)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Results
                </button>

                {canDownload ? (
                  <button
                    onClick={() => handleViewCertificate(result.examId)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    View Certificate
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
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg"
                        onClick={() => router.push(`/results/${result.examId}`)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Continue to payment
                      </button>
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
