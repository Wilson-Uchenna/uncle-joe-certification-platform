"use client";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number>;
  flagged: number[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Question Navigator
        </h4>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
            Answered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Flagged
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            Unanswered
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answers[i] !== undefined;
          const isFlagged = flagged.includes(i);
          const isCurrent = i === currentIndex;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isCurrent ? "ring-2 ring-violet-600 ring-offset-1" : ""
              } ${
                isAnswered
                  ? "bg-violet-600 text-white"
                  : isFlagged
                  ? "bg-amber-400 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}