"use client";
import React from "react";

/**
 * ARWPCE Site Footer
 * -------------------------------------------------------------------------
 * Ported from a static HTML/CSS footer into a self-contained React component.
 *
 * Scoping strategy:
 * - Every rule lives under a single root class (`.arwf`) instead of bare
 *   element selectors (body, *, h1, etc.), so nothing here touches the
 *   global Tailwind/shadcn theme or resets anything outside the footer.
 * - All class names are prefixed with `arwf-` to avoid collisions with
 *   existing utility classes in the host app (e.g. `.login-link`,
 *   `.arrow-icon`, `.register-button`).
 * - Colors are hard-coded to the footer's own design tokens (CSS custom
 *   properties scoped under `.arwf`) rather than reusing `--color-*`
 *   tokens from the app theme, so it renders identically regardless of
 *   which theme is active.
 * - The Google Fonts <link>/<style> import from the original markup was
 *   dropped; the footer inherits the app's font stack. If you want the
 *   original Space Grotesk / Inter pairing, load those fonts at the app
 *   level and swap the `--arwf-font-*` variables below.
 */

const socialLinks = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" className="arwf-social-accent" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" className="arwf-social-accent" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" className="arwf-social-accent-stroke" />
      </svg>
    ),
  },
];

type LinkColumn = {
  title: string;
  links: { label: string; href: string; badge?: string; external?: boolean }[];
};

const linkColumns: LinkColumn[] = [
  {
    title: "About",
    links: [
      { label: "Who We Are", href: "#" },
      { label: "Our Mission", href: "#" },
      { label: "Leadership Team", href: "#" },
      { label: "Partners & Accreditation", href: "#" },
      { label: "Press & Media", href: "#" },
      { label: "Careers", href: "#", badge: "Hiring" },
    ],
  },
  {
    title: "Examinations",
    links: [
      { label: "Exam Overview", href: "#" },
      { label: "Eligibility Criteria", href: "#" },
      { label: "Register for Exam", href: "#" },
      { label: "Exam Schedule", href: "#" },
      { label: "Study Resources", href: "#" },
      { label: "Past Questions", href: "#" },
    ],
  },
  {
    title: "Certification",
    links: [
      { label: "Certificate Tracks", href: "#" },
      { label: "Verify a Certificate", href: "#", badge: "New" },
      { label: "Digital Badges", href: "#" },
      { label: "Recertification", href: "#" },
      { label: "Employer Directory", href: "#" },
      { label: "Remote Job Board", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Candidate Portal", href: "#" },
      { label: "Report an Issue", href: "#" },
      { label: "Skillora Platform", href: "#", external: true },
    ],
  },
];

const legalLinks = ["Privacy Policy", "Terms of Use", "Cookie Policy", "Accessibility"];

export default function Footer() {
  const [email, setEmail] = React.useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Wire this up to your newsletter provider.
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="arwf">
      <div className="arwf-inner">
        {/* TOP: brand + newsletter */}
        <div className="arwf-top">
          <div className="arwf-brand">
            <div className="arwf-brand-logo">
              <div className="arwf-brand-mark" />
              <span className="arwf-brand-name">ARWPCE</span>
            </div>
            <p className="arwf-brand-tagline">
              African Remote Workers Professional Certification Examination — empowering
              Africa&apos;s remote workforce with globally recognised credentials.
            </p>
            <div className="arwf-socials">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} className="arwf-social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="arwf-newsletter">
            <div className="arwf-newsletter-label">Stay in the loop</div>
            <p className="arwf-newsletter-sub">
              Get updates on exam dates, new certifications, and career opportunities — straight
              to your inbox.
            </p>
            <form className="arwf-newsletter-form" onSubmit={handleSubscribe}>
              <input
                className="arwf-newsletter-input"
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="arwf-newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* LINK COLUMNS */}
        <div className="arwf-links">
          {linkColumns.map((col) => (
            <div className="arwf-link-col" key={col.title}>
              <div className="arwf-link-col-title">{col.title}</div>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={link.external ? "arwf-external" : undefined}>
                      {link.label}
                      {link.badge && <span className="arwf-link-badge">{link.badge}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="arwf-bottom">
          <span className="arwf-copy">© {new Date().getFullYear()} ARWPCE. All rights reserved.</span>

          <nav className="arwf-legal-links" aria-label="Legal">
            {legalLinks.map((label) => (
              <a href="#" key={label}>
                {label}
              </a>
            ))}
          </nav>

          <div className="arwf-locale">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Africa / English
          </div>
        </div>
      </div>

      <style>{`
        /* ── Scoped design tokens (footer-only, won't clash with app theme) ── */
        .arwf {
          --arwf-p-500: #3D6EF5;
          --arwf-p-500-hover: #2F5CE0;
          --arwf-p-700: #2447B8;
          --arwf-p-900: #142A66;
          --arwf-white: #FFFFFF;
          --arwf-radius: 14px;
          --arwf-font-heading: 'Space Grotesk', var(--font-sans, sans-serif);
          --arwf-font-body: 'Inter', var(--font-sans, sans-serif);

          background: var(--arwf-p-900);
          color: var(--arwf-white);
          position: relative;
          overflow: hidden;
          font-family: var(--arwf-font-body);
          box-sizing: border-box;
        }
        .arwf, .arwf *, .arwf *::before, .arwf *::after {
          box-sizing: border-box;
        }

        .arwf::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 70% at 5% 0%,   rgba(61,110,245,.14) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 95% 100%, rgba(36,71,184,.18)  0%, transparent 55%);
          pointer-events: none;
        }

        .arwf-inner {
          position: relative; z-index: 1;
          max-width: 1160px;
          margin: 0 auto;
          padding: 72px 48px 0;
        }

        /* ── TOP STRIP ── */
        .arwf-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          padding-bottom: 52px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          flex-wrap: wrap;
        }

        .arwf-brand {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 320px;
          flex: 1 1 260px;
        }

        .arwf-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .arwf-brand-mark {
          width: 36px; height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, var(--arwf-p-500), var(--arwf-p-700));
          position: relative; flex-shrink: 0;
        }
        .arwf-brand-mark::after {
          content: '';
          position: absolute;
          top: 9px; left: 9px;
          width: 13px; height: 13px;
          background: var(--arwf-white);
          border-radius: 3px;
          transform: rotate(45deg);
        }

        .arwf-brand-name {
          font-family: var(--arwf-font-heading);
          font-size: 18px; font-weight: 700;
          color: var(--arwf-white);
          letter-spacing: -.01em;
        }

        .arwf-brand-tagline {
          font-size: 13.5px;
          color: rgba(220,229,254,.55);
          line-height: 1.6;
          font-weight: 400;
          margin: 0;
        }

        .arwf-socials {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .arwf-social-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.10);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; text-decoration: none;
          transition: background .15s ease, border-color .15s ease;
          flex-shrink: 0;
        }
        .arwf-social-btn:hover {
          background: rgba(61,110,245,.25);
          border-color: rgba(61,110,245,.45);
        }
        .arwf-social-btn svg {
          width: 15px; height: 15px;
          fill: rgba(220,229,254,.7);
          transition: fill .15s ease;
        }
        .arwf-social-btn:hover svg { fill: var(--arwf-white); }
        .arwf-social-accent { fill: var(--arwf-p-900) !important; }
        .arwf-social-accent-stroke { stroke: var(--arwf-p-900); stroke-width: 2; }

        .arwf-newsletter {
          flex: 1 1 300px;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .arwf-newsletter-label {
          font-family: var(--arwf-font-heading);
          font-size: 15px; font-weight: 700;
          color: var(--arwf-white);
        }

        .arwf-newsletter-sub {
          font-size: 13px;
          color: rgba(220,229,254,.55);
          line-height: 1.5;
          margin: -4px 0 0;
        }

        .arwf-newsletter-form {
          display: flex;
          gap: 8px;
        }

        .arwf-newsletter-input {
          flex: 1;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13.5px;
          color: var(--arwf-white);
          font-family: var(--arwf-font-body);
          outline: none;
          transition: border-color .15s ease, background .15s ease;
        }
        .arwf-newsletter-input::placeholder { color: rgba(220,229,254,.35); }
        .arwf-newsletter-input:focus {
          border-color: rgba(61,110,245,.55);
          background: rgba(61,110,245,.07);
        }

        .arwf-newsletter-btn {
          background: linear-gradient(135deg, var(--arwf-p-500), var(--arwf-p-700));
          border: none; border-radius: 10px;
          padding: 11px 18px;
          color: var(--arwf-white);
          font-family: var(--arwf-font-body);
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity .15s ease, transform .12s ease;
          box-shadow: 0 3px 12px -4px rgba(61,110,245,.5);
        }
        .arwf-newsletter-btn:hover { opacity: .88; transform: translateY(-1px); }
        .arwf-newsletter-btn:active { opacity: 1; transform: translateY(0); }

        /* ── LINK COLUMNS ── */
        .arwf-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 24px;
          padding: 52px 0;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .arwf-link-col-title {
          font-family: var(--arwf-font-heading);
          font-size: 12px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(220,229,254,.45);
          margin-bottom: 16px;
        }

        .arwf-link-col ul {
          list-style: none;
          display: flex; flex-direction: column;
          gap: 10px;
          margin: 0; padding: 0;
        }

        .arwf-link-col ul li a {
          font-size: 13.5px;
          color: rgba(220,229,254,.7);
          text-decoration: none;
          font-weight: 400;
          transition: color .15s ease;
          line-height: 1.4;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .arwf-link-col ul li a:hover { color: var(--arwf-white); }

        .arwf-link-col ul li a.arwf-external::after {
          content: '';
          display: inline-block;
          width: 10px; height: 10px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(220,229,254,0.4)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/%3E%3Cpolyline points='15 3 21 3 21 9'/%3E%3Cline x1='10' y1='14' x2='21' y2='3'/%3E%3C/svg%3E") no-repeat center/contain;
          opacity: .6;
        }

        .arwf-link-badge {
          font-size: 9.5px; font-weight: 700;
          background: var(--arwf-p-500);
          color: var(--arwf-white);
          padding: 1px 6px; border-radius: 20px;
          letter-spacing: .03em;
          text-transform: uppercase;
          vertical-align: middle;
        }

        /* ── BOTTOM BAR ── */
        .arwf-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 24px 0 28px;
          flex-wrap: wrap;
        }

        .arwf-copy {
          font-size: 12.5px;
          color: rgba(220,229,254,.3);
          font-weight: 400;
        }

        .arwf-legal-links {
          display: flex; gap: 20px; flex-wrap: wrap;
        }
        .arwf-legal-links a {
          font-size: 12.5px;
          color: rgba(220,229,254,.35);
          text-decoration: none;
          font-weight: 500;
          transition: color .15s ease;
        }
        .arwf-legal-links a:hover { color: rgba(220,229,254,.8); }

        .arwf-locale {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px;
          color: rgba(220,229,254,.3);
        }
        .arwf-locale svg {
          width: 13px; height: 13px;
          stroke: rgba(220,229,254,.3);
          fill: none; stroke-width: 2;
          stroke-linecap: round; stroke-linejoin: round;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .arwf-inner { padding: 56px 32px 0; }
          .arwf-links { grid-template-columns: repeat(2, 1fr); gap: 32px 24px; }
        }

        @media (max-width: 680px) {
          .arwf-inner { padding: 48px 20px 0; }
          .arwf-top { flex-direction: column; gap: 36px; padding-bottom: 40px; }
          .arwf-brand { max-width: 100%; }
          .arwf-newsletter { max-width: 100%; }
          .arwf-links { grid-template-columns: repeat(2, 1fr); padding: 40px 0; gap: 28px 16px; }
          .arwf-bottom { flex-direction: column; align-items: flex-start; gap: 12px; padding-bottom: 32px; }
          .arwf-legal-links { gap: 14px; }
        }

        @media (max-width: 420px) {
          .arwf-links { grid-template-columns: 1fr 1fr; gap: 24px 12px; }
          .arwf-newsletter-form { flex-direction: column; }
          .arwf-newsletter-btn { width: 100%; }
        }
      `}</style>
    </footer>
  );
}