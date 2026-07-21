// app/components/UserProfileDashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Tag,
  Briefcase,
  Save,
  Pencil,
  X,
  Shield,
  Lock,
  Eye,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────
interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  school: string;
  state: string;
  country: string;
  role: string;
  onboardingComplete: boolean;
  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  selectedCategorySlug: string | null;
  selectedRole: string | null;
}

// ─── Color Scheme ──────────────────────────────────────
const COLORS = {
  bg: "#2c2c2c",
  bgElevated: "#363636",
  bgCard: "#3a3a3a",
  border: "#4a4a4a",
  textPrimary: "#ebebfa",
  textSecondary: "#c8c3f5",
  textMuted: "#9a99a7",
  textDisabled: "#6b6b7b",
  primary: "#4b46e1",
  primaryHover: "#463ccd",
  primaryActive: "#3c37b4",
  primaryDark: "#3732aa",
  primaryDarker: "#2d2887",
  primaryDarkest: "#231e64",
  primaryDeep: "#191950",
  success: "#22c55e",
  danger: "#ef4444",
};

// ─── Component ─────────────────────────────────────────
export default function UserProfileDashboard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [original, setOriginal] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to load profile");
      }

      const data: ProfileData = json.data;
      setProfile(data);
      setOriginal(data);
    } catch (err) {
      setErrorToast(err instanceof Error ? err.message : "Failed to load profile");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    if (!profile || !original) return;

    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      setHasChanges(
        next.full_name !== original.full_name ||
          next.phone !== original.phone ||
          next.school !== original.school ||
          next.state !== original.state ||
          next.country !== original.country
      );
      return next;
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          school: profile.school,
          state: profile.state,
          country: profile.country,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to save");
      }

      setOriginal(profile);
      setHasChanges(false);
      setIsEditing(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      setErrorToast(err instanceof Error ? err.message : "Failed to save");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) {
      setProfile(original);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: COLORS.bg }}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: COLORS.primary }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: COLORS.bg, color: COLORS.textMuted }}
      >
        Failed to load profile. Please refresh.
      </div>
    );
  }

  const editableFields: Array<{
    key: keyof ProfileData;
    label: string;
    icon: React.ElementType;
    placeholder: string;
    type?: string;
  }> = [
    { key: "full_name", label: "Full Name", icon: User, placeholder: "Enter your full name" },
    { key: "email", label: "Email Address", icon: Mail, placeholder: "Enter your email", type: "email" },
    { key: "phone", label: "Phone Number", icon: Phone, placeholder: "Enter your phone number", type: "tel" },
    { key: "school", label: "School / Employer", icon: GraduationCap, placeholder: "Enter your school or employer" },
    { key: "state", label: "State", icon: MapPin, placeholder: "Enter your state" },
    { key: "country", label: "Country", icon: Globe, placeholder: "Enter your country" },
  ];

  const readOnlyFields: Array<{
    key: string;
    label: string;
    icon: React.ElementType;
    value: string;
  }> = [
    {
      key: "onboardingComplete",
      label: "Onboarding Status",
      icon: CheckCircle2,
      value: profile.onboardingComplete ? "Completed" : "Incomplete",
    },
    {
      key: "selectedCategoryName",
      label: "Selected Category",
      icon: Tag,
      value: profile.selectedCategoryName ?? "Not selected",
    },
    {
      key: "selectedCategorySlug",
      label: "Category Slug",
      icon: Tag,
      value: profile.selectedCategorySlug ?? "Not selected",
    },
    {
      key: "selectedCategoryId",
      label: "Category ID",
      icon: Tag,
      value: profile.selectedCategoryId ?? "Not selected",
    },
    {
      key: "selectedRole",
      label: "Selected Role",
      icon: Briefcase,
      value: profile.selectedRole ?? "Not assigned",
    },
    {
      key: "role",
      label: "System Role",
      icon: Shield,
      value: profile.role,
    },
  ];

  const completionItems = [
    { label: "Basic Info", done: !!profile.full_name && !!profile.email },
    { label: "Contact Details", done: !!profile.phone },
    { label: "School / Employer", done: !!profile.school },
    { label: "Location", done: !!profile.state && !!profile.country },
  ];

  const completionPercent = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary }}
    >
      {/* Top Bar */}
      <nav
        className="sticky top-0 z-50 border-b px-5 py-4 md:px-8 md:py-5"
        style={{
          backgroundColor: "rgba(44,44,44,0.95)",
          borderColor: COLORS.border,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold md:text-lg">Profile Settings</h1>
              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                Manage your account information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="h-9 gap-2 rounded-lg px-4 text-sm font-semibold"
                style={{ backgroundColor: COLORS.primary, color: "white" }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="h-9 gap-2 rounded-lg px-4 text-sm font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="h-9 gap-2 rounded-lg px-4 text-sm font-semibold"
                  style={{
                    backgroundColor: hasChanges ? COLORS.primary : COLORS.primaryDark,
                    color: "white",
                    opacity: hasChanges ? 1 : 0.5,
                  }}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column — Editable Fields */}
          <div className="space-y-6">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight md:text-2xl"
                style={{ color: COLORS.textPrimary }}
              >
                Personal Information
              </h2>
              <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>
                Update your profile details. These fields can be changed at any time.
              </p>
            </div>

            <div
              className="rounded-2xl border p-5 md:p-7"
              style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
            >
              <div className="space-y-5">
                {editableFields.map((field) => {
                  const Icon = field.icon;
                  const isEmail = field.key === "email";
                  return (
                    <div key={field.key} className="space-y-2">
                      <Label
                        htmlFor={field.key}
                        className="flex items-center gap-2 text-sm font-medium"
                        style={{ color: COLORS.textSecondary }}
                      >
                        <Icon className="h-4 w-4" style={{ color: COLORS.primary }} />
                        {field.label}
                      </Label>
                      {isEditing && !isEmail ? (
                        <Input
                          id={field.key}
                          type={field.type || "text"}
                          value={profile[field.key] as string}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="h-11 rounded-xl border-2 px-4 text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-0"
                          style={{
                            backgroundColor: COLORS.bgElevated,
                            borderColor: COLORS.border,
                            color: COLORS.textPrimary,
                          }}
                        />
                      ) : (
                        <div
                          className="flex h-11 items-center rounded-xl border px-4 text-sm"
                          style={{
                            backgroundColor: COLORS.bgElevated,
                            borderColor: COLORS.border,
                            color: (profile[field.key] as string)
                              ? COLORS.textPrimary
                              : COLORS.textDisabled,
                          }}
                        >
                          {(profile[field.key] as string) || (
                            <span style={{ color: COLORS.textDisabled }}>Not provided</span>
                          )}
                          {isEmail && (
                            <Lock className="ml-auto h-3.5 w-3.5" style={{ color: COLORS.textDisabled }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3 md:hidden">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 rounded-xl"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textMuted,
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="flex-1 rounded-xl font-semibold"
                    style={{
                      backgroundColor: hasChanges ? COLORS.primary : COLORS.primaryDark,
                      color: "white",
                      opacity: hasChanges ? 1 : 0.5,
                    }}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Read-Only & Stats */}
          <div className="space-y-6">
            {/* Account Details Card */}
            <div
              className="rounded-2xl border p-5 md:p-6"
              style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${COLORS.primary}20` }}
                >
                  <Lock className="h-5 w-5" style={{ color: COLORS.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: COLORS.textPrimary }}>
                    Account Details
                  </h3>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    System-managed fields
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {readOnlyFields.map((field) => {
                  const Icon = field.icon;
                  const isComplete = field.key === "onboardingComplete" && profile.onboardingComplete;

                  return (
                    <div
                      key={field.key}
                      className="flex items-start gap-3 rounded-xl p-3"
                      style={{ backgroundColor: COLORS.bgElevated }}
                    >
                      <div
                        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isComplete
                            ? `${COLORS.success}15`
                            : `${COLORS.primary}15`,
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: isComplete ? COLORS.success : COLORS.primary }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: COLORS.textMuted }}
                        >
                          {field.label}
                        </p>
                        <p
                          className="mt-0.5 truncate text-sm font-medium"
                          style={{ color: COLORS.textPrimary }}
                        >
                          {field.value}
                        </p>
                      </div>
                      {isComplete && (
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 flex-shrink-0"
                          style={{ color: COLORS.success }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                className="mt-5 flex items-start gap-3 rounded-xl border p-4"
                style={{
                  backgroundColor: `${COLORS.primaryDeep}30`,
                  borderColor: `${COLORS.primaryDarker}50`,
                }}
              >
                <Eye
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color: COLORS.textSecondary }}
                />
                <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>
                  These fields are set during onboarding and cannot be changed from this page.
                  Contact support if you need to update them.
                </p>
              </div>
            </div>

            {/* Profile Completion */}
            <div
              className="rounded-2xl border p-5 md:p-6"
              style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
            >
              <h3 className="mb-4 font-semibold" style={{ color: COLORS.textPrimary }}>
                Profile Completion
              </h3>
              <div className="space-y-3">
                {completionItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          item.done ? "border-transparent" : "border-dashed"
                        )}
                        style={{
                          backgroundColor: item.done ? COLORS.primary : "transparent",
                          borderColor: item.done ? "transparent" : COLORS.border,
                        }}
                      >
                        {item.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: item.done ? COLORS.textPrimary : COLORS.textDisabled,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: item.done ? COLORS.success : COLORS.textMuted }}
                    >
                      {item.done ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>
                    Overall
                  </span>
                  <span className="text-xs font-bold" style={{ color: COLORS.primary }}>
                    {completionPercent}%
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: COLORS.bgElevated }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercent}%`, backgroundColor: COLORS.primary }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[150] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg transition-all duration-300",
          savedToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
        style={{
          backgroundColor: COLORS.primaryDarker,
          color: "white",
          boxShadow: "0 16px 32px -14px rgba(25,21,80,0.5)",
        }}
      >
        <CheckCircle2 className="h-5 w-5" style={{ color: COLORS.success }} />
        <span className="text-sm font-semibold">Profile saved successfully</span>
      </div>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-[150] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg transition-all duration-300",
          errorToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
        style={{
          backgroundColor: COLORS.danger,
          color: "white",
          boxShadow: "0 16px 32px -14px rgba(239,68,68,0.4)",
        }}
      >
        <X className="h-5 w-5" />
        <span className="text-sm font-semibold">{errorToast}</span>
      </div>
    </div>
  );
}