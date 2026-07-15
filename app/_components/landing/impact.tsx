export default function Impact() {
  return (
    <section>
      <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#1a1a4e]">
        <div className="max-w-4xl mx-auto text-center">
          {/* Label */}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-4 block">
            Our Impact
          </span>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-6 leading-tight">
            Every learner deserves an opportunity
            <br className="hidden md:block" />
            to succeed.
          </h2>

          {/* Subtext */}
          <p className="text-sm text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            At A.R.W.P.C, we're building a future where skills open doors,
            certifications build confidence, and opportunities create lasting
            careers.
          </p>

          {/* Two cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Mission */}
            <div className="bg-[#252560] rounded-xl p-6 md:p-8">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-3 block">
                Our Mission
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">
                To empower individuals with practical skills, recognized
                certifications, and meaningful career opportunities that enable
                them to thrive in the global workforce.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-[#252560] rounded-xl p-6 md:p-8">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-3 block">
                Our Vision
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">
                To become Africa's leading platform for career-focused learning,
                professional certification, and employment opportunities,
                connecting skilled talent with organizations worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
