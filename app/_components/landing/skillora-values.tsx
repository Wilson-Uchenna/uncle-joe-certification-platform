const VALUES = [
  {
    title: "Excellence",
    description: "We are committed to delivering high-quality learning experiences and trusted certifications.",
  },
  {
    title: "Innovation",
    description: "We embrace technology and creative solutions to improve learning and career development.",
  },
  {
    title: "Integrity",
    description: "We believe in transparency, fairness, and credibility in every certification and opportunity.",
  },
  {
    title: "Growth",
    description: "We encourage continuous learning, self-improvement, and lifelong professional development.",
  },
  {
    title: "Opportunity",
    description: "We believe everyone deserves access to education, meaningful work, and a brighter future.",
  },
];

export default function SkilloraValues() {
    return (
        <section>
            <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    {/* Header */}
    <div className="text-center mb-12">
      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">
        Our Core Values
      </span>
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
        What drives everything we do
      </h2>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {VALUES.map(({ title, description }) => (
        <div 
          key={title} 
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          {/* Small purple dot */}
          <div className="w-2 h-2 rounded-full bg-indigo-600 mb-4" />
          
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {title}
          </h4>
          
          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>
        </section>
    )
}