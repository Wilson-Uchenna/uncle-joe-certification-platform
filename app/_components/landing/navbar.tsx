"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoveUpRight } from "lucide-react";

const NAVIGATION_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Success Stories", href: "/#success-stories" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = !!session;
  const pathname = usePathname();

  // isPending is true while loading — use it if you want a skeleton/loader

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center w-full px-4 md:px-2 max-w-[1500px] mx-auto h-24">
        {/* logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-lg md:text-sm text-primary tracking-tight inline-flex gap-2 ml-2 items-center"
        >
          <img src="/company-logo.jpeg" alt="Company Logo" className="w-[10rem] md:w-[10rem]" />
        </Link>

        <div className="hidden min-[1024px]:flex items-center gap-6 text-base">
          {NAVIGATION_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-on-surface-variant hover:text-secondary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="flex items-center gap-2 hidden min-[1024px]:flex">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="hidden md:block px-6 py-2 bg-opportunity-gold text-white rounded-full font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="sm:hidden px-6 py-2 text-secondary font-bold hover:scale-95 transition-all inline login-link"
              >
                <div>Sign In</div>
                <MoveUpRight className="arrow-icon" />
              </Link>
              <Link
                href="/register"
                className="hidden md:block px-6 py-2 register-button text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all bg-purple-600"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
        <div>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="min-[1023px]:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-surface-container transition-colors"
          >
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`}
            />
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`}
            />
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`min-[1023px]:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 border-t border-outline-variant/40" : "max-h-0"}`}
      >
        <div className="px-4 py-4 flex flex-col gap-1 bg-background">
          {NAVIGATION_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-on-surface-variant text-sm font-medium py-3 border-b border-outline-variant/30 hover:text-secondary transition-colors last:border-0"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-center text-sm font-bold text-white bg-opportunity-gold py-3 rounded-full hover:shadow-lg transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-center text-sm font-bold text-white bg-secondary py-3 rounded-full hover:shadow-lg transition-all"
                >
                  Sign In
                  <MoveUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-bold text-white bg-opportunity-gold py-3 rounded-full hover:shadow-lg transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
