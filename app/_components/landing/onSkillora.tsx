import { BookOpen, Award, Briefcase, Globe, type LucideProps } from "lucide-react";
import type { FC } from "react";

interface FeatureItem {
    Icon: FC<LucideProps>
    title: string;
    description: string;
}

const FEATURES: FeatureItem[] = [
  { Icon: BookOpen, title: "Learn Practical Skills", description: "Access high-quality, career-focused courses designed to prepare you for today's most in-demand industries." },
  { Icon: Award, title: "Earn Professional Certifications", description: "Complete assessments and earn certificates that showcase your knowledge and demonstrate your commitment to professional growth." },
  { Icon: Briefcase, title: "Discover Internship Opportunities", description: "Gain hands-on experience through internships that help you build confidence and strengthen your career journey." },
  { Icon: Globe, title: "Find Remote Jobs", description: "Connect with verified employers and apply for remote opportunities that match your skills and career goals." },
];
export default function Onskillora() {
    return (
        <section>
            <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  {/* Section label */}
  <h3 className="text-center text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-12">
    What You Can Do on A.R.W.P.C
  </h3>

  {/* Cards grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    {FEATURES.map(({ Icon, title, description }) => (
      <div 
        key={title} 
        className="bg-white rounded-xl border border-gray-100 p-6 md:p-8"
      >
        {/* Icon in light purple circle */}
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-5">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-gray-900 mb-3 leading-snug">
          {title}
        </h4>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    ))}
  </div>
</div>
        </section>
    )
}