import {
  Briefcase,
  FileText,
  FolderOpen,
  Globe,
  ShieldCheck,
  View,
} from "lucide-react";

export default function CertificationUse() {
  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left card — Where Can I Use My Certificate? */}
        <div className="bg-gray-100 rounded-xl p-8 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-6">
            Where Can I Use My Certificate?
          </h3>

          <div className="space-y-5">
            {[
              { icon: FileText, text: "Add to your CV or résumé" },
              {
                icon: View,
                text: "Share on LinkedIn & professional platforms",
              },
              { icon: Briefcase, text: "Include in internship applications" },
              { icon: Globe, text: "Submit during job applications" },
              { icon: FolderOpen, text: "Add to your professional portfolio" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="rounded-sm p-2 bg-gray-200">
                  <Icon
                    className="w-5 h-5 text-indigo-500 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                </div>

                <span className="text-sm text-gray-600">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right card — Certificate Verification */}
        <div className="bg-[#1a1a4e] rounded-xl p-8 text-white">
          {/* Shield icon */}
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6">
            <ShieldCheck
              className="w-5 h-5 text-indigo-400"
              strokeWidth={1.5}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4">
            Certificate Verification
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed mb-8">
            Every Skillora Certification includes a secure verification code
            that allows employers and institutions to confirm its authenticity —
            ensuring trust, credibility, and recognition for every learner's
            achievement.
          </p>

          {/* Bottom badge */}
          <div className="bg-[#252560] rounded-lg px-4 py-3 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
            <span className="text-xs text-gray-300 leading-relaxed">
              Unique verification code included on every certificate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
