'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MailCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type Phase = 'checking' | 'pending' | 'verifying' | 'done' | 'error';

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email');

  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const finalizing = useRef(false);

  // Check if already verified on mount
  useEffect(() => {
    async function checkSession() {
      const { data: session } = await authClient.getSession();

      if (session?.user?.emailVerified) {
        setPhase('done');
        setTimeout(() => router.replace('/role-onboarding'), 1500);
      } else {
        setPhase('pending');
        // Start resend countdown
        const interval = setInterval(() => {
          setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
      }
    }

    checkSession();
  }, [router]);

  // Send OTP on mount if email exists
  useEffect(() => {
    if (email && phase === 'pending') {
      sendOtp();
    }
  }, [email, phase]);

  async function sendOtp() {
    if (!email) return;

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });

      if (error) {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong sending the code.');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !otp) return;

    setPhase('verifying');
    setError(null);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        setPhase('pending');
        setError('Invalid code. Please try again.');
        return;
      }

      // Success
      setPhase('done');
      setTimeout(() => router.replace('/role-onboarding'), 1500);
    } catch (err) {
      setPhase('pending');
      setError('Verification failed. Please try again.');
    }
  }

  async function handleResend() {
    setResendTimer(60);
    await sendOtp();
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 md:px-10 pt-28 pb-12">
      <div
        className="w-full max-w-[480px] bg-white rounded-xl p-8 md:p-12 border border-gray-200 text-center"
        style={{ boxShadow: '0 20px 50px rgba(0, 32, 69, 0.1)' }}
      >
        {/* Checking / Verifying / Done states */}
        {(phase === 'checking' || phase === 'verifying' || phase === 'done') && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-3">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {phase === 'done'
                ? 'Email verified!'
                : phase === 'verifying'
                ? 'Verifying...'
                : 'One moment…'}
            </h1>
            <p className="text-gray-600">
              {phase === 'done'
                ? 'Redirecting you to your role onboarding.'
                : phase === 'verifying'
                ? 'Checking your verification code.'
                : 'Checking your verification status.'}
            </p>
          </>
        )}

        {/* Pending - Enter OTP */}
        {phase === 'pending' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-3">
              <MailCheck className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify your email
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a 6-digit code
              {email ? (
                <>
                  {' '}
                  to <span className="font-bold text-gray-900">{email}</span>
                </>
              ) : null}
              . Enter it below to activate your account.
            </p>

            {/* OTP Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={otp.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Verify Email
              </button>
            </form>

            {/* Resend */}
            <div className="mt-6">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Resend verification code
                </button>
              )}
            </div>

            <div className="mt-4 inline-flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Registration received
            </div>
          </>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600">{error}</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              Back to Register
            </Link>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center pt-28 pb-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}