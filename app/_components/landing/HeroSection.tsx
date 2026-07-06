import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[40vh] flex items-center overflow-hidden text-center justify-between mt-1 pt-20">
      <div className="max-w-[1040px] mx-auto px-4 md:px-22 w-full items-center py-12 md:py-4 md:mt-4">
        <div className="">
          <h1 className="text-2xl lg:text-4xl xl:text-6xl md:text-[4rem] font-[400] text-primary leading-tight">
            Build Skills. Earn Certifications. Get Hired.
          </h1>
        </div>
        <div className="mx-auto max-w-[960px] md:px-22 w-full mt-2">
          <p className="text-lg text-on-surface-variant leading-7">
            Unlock your career potential with Skillora Certification. Learn
            practical, in-demand skills, earn industry-recognized
            certifications, gain internship opportunities, and connect with
            remote jobs — all on one platform.
          </p>
        </div>
        {/* Desktop buttons */}
          <div className="hidden md:flex items-center justify-center flex-wrap gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3 rounded-sm bg-purple-600 text-white font-bold shadow-lg hover:bg-secondary/90 hover:scale-105 transition-all flex items-center gap-2"
            >
              Start Learning
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border-2 bg-black text-white rounded-sm font-bold hover:px-10 transition-all"
            >
              Explore Career Opportunities
            </Link>
          </div>
      </div>
    </section>
  );
}
