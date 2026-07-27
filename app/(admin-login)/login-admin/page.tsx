"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Admin login — email + password (no OTP step, admins are seeded/promoted directly).
 * Color tokens below map to the "Foundation / Primaryc" palette:
 *   Light        #EEF0FF   Normal        #4F46E5   Dark        #1E1B4B
 *   Light:hover  #E0E4FF   Normal:hover  #4338CA   Dark:hover  #171433
 *   Light:active #C7CDFF   Normal:active #3730A3   Dark:active #100D24
 *   Darker       #0B0917
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      return;
    }

    setIsLoading(true);

    const res = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (res.error) {
      setError(res.error.message ?? "Invalid email or password");
      setIsLoading(false);
      return;
    }

    // Confirm this account actually has admin privileges
    const { data: session } = await authClient.getSession();

    if (session?.user?.role !== "admin") {
      setError("This account does not have admin access");
      await authClient.signOut();
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    if (session.user.tempPassword) {
      // Stay on this page, show the forced change-password modal on top
      setShowChangePasswordModal(true);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0B0917" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 sm:p-10 border"
        style={{ backgroundColor: "#100D24", borderColor: "#1E1B4B" }}
      >
        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "#4F46E5" }}
          >
            <ShieldCheck className="w-6 h-6" style={{ color: "#EEF0FF" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#EEF0FF" }}>
            Admin Sign In
          </h1>
          <p className="text-sm mt-2" style={{ color: "#8B85C4" }}>
            Restricted access — authorized administrators only
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="text-sm rounded-lg px-4 py-3 mb-6 border"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
            }}
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2"
              style={{ color: "#C7CDFF" }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "#5A55A0" }}
              />
              <input
                type="email"
                id="email"
                autoComplete="username"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@yoursite.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: "#0B0917",
                  borderColor: "#1E1B4B",
                  color: "#EEF0FF",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
              style={{ color: "#C7CDFF" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "#5A55A0" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: "#0B0917",
                  borderColor: "#1E1B4B",
                  color: "#EEF0FF",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#5A55A0" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isLoading ? "#3730A3" : "#4F46E5",
              color: "#EEF0FF",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#4338CA";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#4F46E5";
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Back to regular login */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm transition-colors"
              style={{ color: "#8B85C4" }}
            >
              ← Back to regular sign in
            </Link>
          </div>
        </form>
      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal
          onSuccess={() => router.push("/admin/dashboard")}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ onSuccess }: { onSuccess: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to update password");
      return;
    }

    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(11, 9, 23, 0.8)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 border"
        style={{ backgroundColor: "#100D24", borderColor: "#1E1B4B" }}
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: "#EEF0FF" }}>
            Set a New Password
          </h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "#8B85C4" }}>
          You're using a temporary password. Choose a new one to continue —
          this step can't be skipped.
        </p>

        {error && (
          <div
            className="text-sm rounded-lg px-4 py-3 mb-5 border"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
            }}
          >
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold mb-2"
              style={{ color: "#C7CDFF" }}
            >
              New Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "#5A55A0" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#0B0917",
                  borderColor: "#1E1B4B",
                  color: "#EEF0FF",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#5A55A0" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-2"
              style={{ color: "#C7CDFF" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "#5A55A0" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#0B0917",
                  borderColor: "#1E1B4B",
                  color: "#EEF0FF",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: "#4F46E5", color: "#EEF0FF" }}
          >
            {isLoading ? "Updating..." : "Update Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}