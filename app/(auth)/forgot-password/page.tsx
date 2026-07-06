'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound, GraduationCap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';


export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus('loading');

    const email = (new FormData(e.currentTarget).get('email') as string).trim();

    // try {
    //   await sendPasswordReset(email);
    //   setStatus('success');
    // } catch (err) {
    //   setStatus('idle');
    //   setError(
    //     err instanceof Error ? err.message : 'Could not send reset link. Please try again.'
    //   );
    // }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 md:px-10 pt-28 pb-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-opportunity-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className="w-full max-w-[480px] bg-white rounded-xl p-8 md:p-12 z-10 border border-surface-container"
        style={{ boxShadow: '0 20px 50px rgba(0, 32, 69, 0.1)' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-low text-secondary rounded-full mb-3">
            <KeyRound className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-headline-md text-primary mb-2">Reset Your Password</h1>
          <p className="text-body-md text-on-surface-variant">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Form / Success state */}
        {status === 'success' ? (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-success-green/10 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-success-green" />
            </div>
            <p className="text-body-md text-on-surface font-bold">Check your inbox</p>
            <p className="text-body-md text-on-surface-variant">
              We&apos;ve sent reset instructions to your email.
            </p>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
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
                disabled={status === 'loading'}
                className="w-full py-4 bg-primary-container text-white rounded-full font-bold shadow-lg hover:bg-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
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
            Having trouble?{' '}
            <a href="#" className="text-secondary font-semibold hover:underline">
              Contact Support
            </a>
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
