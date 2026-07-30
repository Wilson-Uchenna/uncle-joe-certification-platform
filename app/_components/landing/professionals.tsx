const PROFESSIONALS = [
  { image: "/Emeka Nwosu.jpg", name: "Emeka Nwosu", job: "DATA ANALYST" },
  { image: "/Chidi Okafor.jpg", name: "Chidi Okafor", job: "CYBERSECURITY" },
  { image: "/Ngozi Adeyemi.jpg", name: "Ngozi Adeyemi", job: "PRODUCT MANAGER" },
  {
    image: "/Emma Johnson.png",
    name: "Emma Johnson",
    job: "GRAPHICS DESIGNER",
  },
  {
    image: "/Sophia Brown.png",
    name: "Sophia Brown",
    job: "SOFTWARE ENGINEER",
  },
];

const FIGURES = [
  { number: "50k+", text: "ACTIVE LEARNERS" },
  { number: "500+", text: "HIRING PARTNERS" },
  { number: "12k+", text: "CERTIFICATIONS EARNED" },
  { number: "94%", text: "PLACEMENT RATE" },
];

export default function Professionals() {
  return (
    <section className="relative min-h-[40vh]  overflow-hidden text-center justify-between mt-15 font-[600]">
      <div className="w-4/5 px-8 sm:px-6 lg:px-10 xl:px-12 mx-auto">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-800 mb-8">
          Trusted by professionals like you
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {PROFESSIONALS.map(({ image, name, job }) => (
            <div key={name}>
              <div className="aspect-[4/5] rounded-lg overflow-hidden mb-3">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm text-start font-bold text-gray-900">
                {name}
              </h3>
              <p className="text-[11px] text-start font-medium text-gray-500 uppercase tracking-wide leading-tight">
                {job}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full border-y border-gray-200 mt-22 px-4 mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {FIGURES.map(({ number, text }, index) => (
            <div
              key={text}
              className={`flex flex-col items-center justify-center py-10 md:py-12 ${
                index < FIGURES.length - 1 ? "border-r border-gray-200" : ""
              }`}
            >
              <span className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                {number}
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
