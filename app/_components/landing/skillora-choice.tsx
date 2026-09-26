"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SkilloraChoice() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  function handleClick() {
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  }

  return (
    <section className="bg">
      <div className="py-6 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-[600]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-4">
              Why Choose A.R.W.P.C?
            </span>

            <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 leading-tight">
              Everything you need
              <br />
              to grow
              <br />
              professionally
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              A.R.W.P.C combines learning, certification, internships, and remote
              employment into one seamless experience — helping you transform
              knowledge into real career outcomes.
            </p>

            <button
              onClick={handleClick}
              disabled={isPending}
              className="self-start flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" strokeWidth={3} />
              {session?.user ? "Go to Dashboard" : "Create Your Free Account"}
            </button>
          </div>

          {/* Right column — checklist with check marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 mt-4">
            {[
              "Career-focused learning",
              "Industry-relevant certifications",
              "Flexible, self-paced courses",
              "Verified internship opportunities",
              "Access to remote jobs",
              "Professional career development",
              "Employer connections",
              "Continuous learning opportunities",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}