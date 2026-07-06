const STORIES = [
  {
    image: "/Jonathan Mike.png",
    stat: "4 months",
    statLabel: "to first offer",
    quote:
      "Skillora gave me the certifications I needed to transition from retail into tech. Within 4 months of completing the Data Analytics track, I had three job offers. I chose Stripe and couldn't be happier.",
    name: "Jonathan Mike",
    role: "Data Analyst",
  },
  {
    image: "/Liam Carter.png",
    stat: "2×",
    statLabel: "salary increase",
    quote:
      "I was self-taught with no formal credentials. Skillora's certifications made my resume credible and their job board connected me to a role I genuinely love. The mentorship was the real game changer.",
    name: "Liam Carter",
    role: "Cybersecurity Analyst",
  },
  {
    image: "/Noah Smith.png",
    stat: "6 weeks",
    statLabel: "to full-time offer",
    quote:
      "Fresh out of university with a business degree, I had no idea how to break into product management. Skillora's PM certification and internship match gave me everything I needed.",
    name: "Noah Smith",
    role: "Product Manager",
  },
];

export default function SuccessStoriess() {
  return (
    <section>
      <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">
              Success Stories
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Real people. Real results.
            </h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORIES.map(({ image, stat, statLabel, quote, name, role }) => (
              <div
                key={name}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Stat */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      {stat}
                    </span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">
                      {statLabel}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    "{quote}"
                  </p>

                  {/* Name & Role */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
