"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client"; // adjust path to match your project

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: request the OTP
  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const submittedEmail = (
      new FormData(e.currentTarget).get("email") as string
    ).trim();

    const { error } = await authClient.emailOtp.requestPasswordReset({
      email: submittedEmail,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Could not send code. Please try again.");
      return;
    }

    setEmail(submittedEmail);
    setStep("otp");
  }

  // Step 2: verify the OTP (optional check before reset, per docs)
  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      type: "forget-password",
      otp,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Invalid or expired code. Please try again.");
      return;
    }

    setStep("reset");
  }

  // Step 3: set the new password
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Could not reset password. Please try again.");
      return;
    }

    setStep("success");
  }

  async function handleResendCode() {
    setError(null);
    setIsLoading(true);
    const { error } = await authClient.emailOtp.requestPasswordReset({
      email,
    });
    setIsLoading(false);
    if (error) {
      setError(error.message ?? "Could not resend code.");
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 md:px-10 pt-28 pb-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-opportunity-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className="w-full max-w-[480px] bg-white rounded-xl p-8 md:p-12 z-10 border border-surface-container"
        style={{ boxShadow: "0 20px 50px rgba(0, 32, 69, 0.1)" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-low text-secondary rounded-full mb-3">
            <KeyRound className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-headline-md text-primary mb-2">
            {step === "success" ? "Password Reset" : "Reset Your Password"}
          </h1>
          {step === "email" && (
            <p className="text-body-md text-on-surface-variant">
              Enter the email address associated with your account and
              we&apos;ll send you a code to reset your password.
            </p>
          )}
          {step === "otp" && (
            <p className="text-body-md text-on-surface-variant">
              Enter the 6-digit code we sent to{" "}
              <span className="font-semibold">{email}</span>.
            </p>
          )}
          {step === "reset" && (
            <p className="text-body-md text-on-surface-variant">
              Choose a new password for your account.
            </p>
          )}
        </div>

        {/* Step: email */}
        {step === "email" && (
          <form className="space-y-3" onSubmit={handleSendCode}>
            <div className="space-y-2">
              <label
                htmlFor="fp-email"
                className="block text-label-caps text-on-surface-variant uppercase tracking-widest ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                <input
                  id="fp-email"
                  name="email"
                  type="email"
                  required
                  placeholder="student@example.com"
                  className="w-full pl-11 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-error text-body-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary-container text-white rounded-full font-bold shadow-lg hover:bg-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step: otp */}
        {step === "otp" && (
          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-error text-body-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full py-4 bg-primary-container text-white rounded-full font-bold shadow-lg hover:bg-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="w-full text-center text-sm text-secondary font-semibold hover:underline disabled:opacity-50"
            >
              Didn&apos;t get a code? Resend
            </button>
          </form>
        )}

        {/* Step: reset password */}
        {step === "reset" && (
          <form className="space-y-3" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <label
                htmlFor="fp-password"
                className="block text-label-caps text-on-surface-variant uppercase tracking-widest ml-1"
              >
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                <input
                  id="fp-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-11 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="fp-confirm-password"
                className="block text-label-caps text-on-surface-variant uppercase tracking-widest ml-1"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                <input
                  id="fp-confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-11 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-error text-body-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary-container text-white rounded-full font-bold shadow-lg hover:bg-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step: success */}
        {step === "success" && (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-success-green/10 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-success-green" />
            </div>
            <p className="text-body-md text-on-surface font-bold">
              Password reset successful
            </p>
            <p className="text-body-md text-on-surface-variant">
              You can now sign in with your new password.
            </p>
          </div>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-secondary font-bold hover:underline transition-all"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            Back to Login
          </Link>
        </div>

        {/* Help */}
        <div className="mt-12 pt-3 border-t border-surface-container text-center">
          <p className="text-body-md text-on-surface-variant opacity-70">
            Having trouble?{" "}
            
              <Link href="#"
              className="text-secondary font-semibold hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative background card */}
      <div className="hidden lg:block absolute bottom-12 right-12 opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-secondary rounded-xl rotate-12 flex items-center justify-center p-6 border-4 border-white shadow-xl">
          <div className="text-white text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4" strokeWidth={1} />
            <p className="text-headline-sm font-bold">Empowering Excellence</p>
          </div>
        </div>
      </div>
    </main>
  );
}