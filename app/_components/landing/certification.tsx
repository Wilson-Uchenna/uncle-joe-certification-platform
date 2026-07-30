import { ShieldCog } from "lucide-react";

export default function Certification() {
  return (
    <section>
      <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 font-[600]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">
              Certification
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
              What is an African Remote Workers Professional Certification?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Official recognition that you've successfully completed a
              professional learning program. It validates your skills and
              showcases your commitment to continuous learning and career
              growth.
            </p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Left — How Do I Earn One? */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-6">
                How Do I Earn One?
              </h3>

              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-5 md:left-3 top-6 bottom-6 w-px bg-gray-200 md:left-5.5 md:-translate-x-1/2" />

                <div className="flex flex-col gap-8 md:gap-12">
                  {[
                    { num: "01", text: "Enroll in a course" },
                    { num: "02", text: "Complete all learning modules" },
                    { num: "03", text: "Pass the required assessment" },
                    { num: "04", text: "Meet all certification requirements" },
                    { num: "05", text: "Download and share your certificate" },
                  ].map(({ num, text }) => (
                    <div key={num} className="flex items-center gap-4 relative">
                      {/* Number circle */}
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-3 p-5 border-white relative z-10">
                        {num}
                      </span>
                      {/* Text */}
                      <span className="text-sm text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Why Does It Matter? */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-6">
                Why Does It Matter?
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                an African Remote Workers Professional Certification helps you:
              </p>

              <div className="space-y-3">
                {[
                  "Demonstrate practical skills",
                  "Strengthen your CV or résumé",
                  "Build credibility with employers",
                  "Increase confidence during job applications",
                  "Stand out in a competitive job market",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">

                      <ShieldCog className="arrow-icon-2" color="#3e9392"/>
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
