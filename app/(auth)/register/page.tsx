"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  User,
  Phone,
  MapPin,
  Globe,
  Lightbulb,
} from "lucide-react";
import { type ProfileInput } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const SKILL_LEVELS = [
  {
    key: "entry" as const,
    label: "Entry",
  },
  {
    key: "mid" as const,
    label: "Mid",
  },
  {
    key: "advanced" as const,
    label: "Advanced",
  },
];

export default function RegisterPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    employer: "",
    state: "",
    country: "Nigeria",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep1 = () => {
    console.log("DEBUG formData:", formData);
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.state || !formData.country) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep2()) return;

    setIsLoading(true);

    const result = await authClient.signUp.email({
      email: formData.email,
      password: formData.password,
      name: formData.fullName,
      fullName: formData.fullName,
      phone: formData.phone,

      employer: formData.employer,
      state: formData.state,
      country: formData.country,
    } as any);

    if (result.error) {
      setError(result.error.message ?? "An error occurred");
      setIsLoading(false);
      return;
    }

    // User is now logged in, redirect to email verification
    router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
  };

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-[50vh] flex justify-between items-center max-w-[1650px] mx-auto">
      {/* Left side — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex items-center justify-center">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-2 items-center"
            >
              <img
                src="/company-logo.jpeg"
                alt="Company Logo"
                className="w-[10rem] md:w-[15rem]"
              />
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">
            Every successful career begins with one decision. Join a community
            of ambitious students and graduates, build in-demand skills, earn
            industry-recognized certifications, and unlock access to internships
            and remote job opportunities all in one place
          </p>
        </div>

        {/* Added Welcome Message */}
        <div className="bg-indigo-50 rounded-xl p-5 mb-8 border border-indigo-100">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">
            Welcome to African Remote Workers Certification Platform!
          </h3>
          <p className="text-xs text-indigo-700 leading-relaxed mb-2">
            Whether you're preparing for your first job, looking to upskill, or
            ready to explore remote career opportunities, you've come to the
            right place.
          </p>
          <p className="text-xs text-indigo-700 leading-relaxed">
            A.R.W.P.C is designed to help you learn practical skills, earn
            certifications that showcase your abilities, and connect with
            opportunities that move your career forward.
          </p>
        </div>

        {/* Before You Register */}
        <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Before You Register
          </h4>
          <p className="text-xs text-gray-500 mb-3">
            Please have the following information ready:
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              "Full Name",
              "Email Address",
              "Phone Number",
              "Academic Level",
              "School/Institution",
              "State",
              "Country",
              "A secure password",
            ].map((item) => (
              <span
                key={item}
                className="text-xs text-gray-600 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Registration Tips */}
        <div className="bg-amber-50 rounded-xl p-5 mb-8 border border-amber-100">
          <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-3">
            Registration Tips
          </h4>
          <div className="space-y-2">
            {[
              "Use your legal name as it will appear on your certificates.",
              "Register with an active email address to receive important updates.",
              "Create a strong password to protect your account",
              "Double-check your information before submitting.",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-800 leading-relaxed">
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="md:flex md:items-center md:justify-between md:gap-4 sm:block">
            <div className="basis-[30vw] md:basis-[50vw]">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="John@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="basis-[30vw] md:basis-[50vw]">
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="md:flex md:items-center md:justify-between md:gap-4 sm:block">
            {/* Password */}
            <div className="basis-[30vw] md:basis-[50vw]">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  placeholder="*************"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="basis-[30vw] md:basis-[50vw]">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="*************"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="md:flex md:items-center md:justify-between md:gap-4 sm:block">
            <div className="basis-[30vw] md:basis-[50vw]">
              <label
                htmlFor="phone"
                className="text-label-caps text-on-surface-variant uppercase tracking-widest"
              >
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone} // ← ADD THIS
                  onChange={handleChange}
                  required
                  placeholder="+234 800 000 0000"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>
            <div className="basis-[30vw] md:basis-[50vw]">
              {/* State */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="state"
                  className="text-label-caps text-on-surface-variant uppercase tracking-widest"
                >
                  State
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors pointer-events-none z-10" />
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state} // ← ADD THIS (not defaultValue)
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none"
                  >
                    <option value="" disabled>
                      Select your state
                    </option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="md:flex lg:block xl:flex md:items-center md:justify-between md:gap-4 sm:block">
            <div className="basis-[10vw] md:basis-[30vw]">
              {/* Country (read-only, Nigeria) */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="country"
                  className="text-label-caps text-on-surface-variant uppercase tracking-widest"
                >
                  Country
                </label>
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country || "Nigeria"} //
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface-variant cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 p-4 bg-surface-container rounded-lg border-l-4 border-opportunity-gold">
            <span className="material-symbols-outlined text-opportunity-gold shrink-0">
              <Lightbulb />
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong>Note:</strong> Your chosen Academic Level determines which
              subjects will be available for you to select in the next step.
              Please ensure this is accurate.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                agreed
                  ? "bg-indigo-600 border-indigo-600"
                  : "border-gray-300 bg-white"
              }`}
            >
              {agreed && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <span className="text-sm text-gray-600">
              I Have agreed to the{" "}
              <a
                href="#"
                className="text-indigo-600 hover:underline font-medium"
              >
                TERMS OF SERVICE
              </a>
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-64 mx-auto item-center text-center justify-between bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Creating account..." : "Create My Account"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 uppercase">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-[#1877F2]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </form>
      </div>

      {/* Right side — Testimonial Image */}
      <div className="hidden lg:block lg:w-1/2 h-[1000] my-auto relative rounded-full">
        <img
          src="/testimonial-bg.png"
          alt="Testimonial"
          className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl" />

        {/* Testimonial content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white rounded-full">
          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <p className="text-lg leading-relaxed mb-6">
            A.R.W.P.C is an absolute game-changer. I took the exam, seamlessly
            downloaded my certificate, and landed a remote internship just two
            weeks later
          </p>

          <div>
            <p className="font-semibold text-lg">Jessica Davis</p>
            <p className="text-sm text-gray-300">Data Analyst</p>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-6">
            <div className="w-6 h-1 rounded-full bg-white" />
            <div className="w-6 h-1 rounded-full bg-white/40" />
            <div className="w-6 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
