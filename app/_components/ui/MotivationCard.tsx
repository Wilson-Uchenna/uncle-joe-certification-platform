"use client";

interface MotivationCardProps {
  quote: string;
  author?: string;
  icon?: string;
}

const purple = {
  light: "#f3e8ff",
  dark: "#5b21b6",
  darker: "#2e1065",
};

export function MotivationCard({ quote, author, icon = "💡" }: MotivationCardProps) {
  return (
    <div
      className="rounded-2xl p-6 text-center border mb-5"
      style={{
        background: `linear-gradient(135deg, ${purple.light}, #ede4f7)`,
        borderColor: "#d8b4fe",
      }}
    >
      <div className="text-[28px] mb-2">{icon}</div>
      <p className="text-sm text-[#2e1065] leading-[1.7] font-medium">{quote}</p>
      {author && (
        <div className="text-xs text-violet-700 mt-2 font-semibold">{author}</div>
      )}
    </div>
  );
}
