import { Check } from "lucide-react";

export default function SkilloraChoice() {
  return (
    <section className="bg">
      <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-4">
              Why Choose Skillora?
            </span>

            <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 leading-tight">
              Everything you need
              <br />
              to grow
              <br />
              professionally
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              Skillora combines learning, certification, internships, and remote
              employment into one seamless experience — helping you transform
              knowledge into real career outcomes.
            </p>

            <button className="self-start bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors">
              Create Your Free Account
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
