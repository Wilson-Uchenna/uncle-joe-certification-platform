import { Flag } from "lucide-react";

interface QuestionCardProps {
  question: {
    question: string;
    options: string[];
    codeSnippet?: string;
    language?: string;
  };
  selectedOptionIndex?: number;
  isFlagged: boolean;
  onSelectOption: (index: number) => void;
  onToggleFlag: () => void;
}

export function QuestionCard({
  question,
  selectedOptionIndex,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 mb-4">
      {/* Question Text */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-800 font-medium leading-relaxed flex-1">
          {question.question}
        </p>
        <button
          onClick={onToggleFlag}
          className={`ml-3 p-2 rounded-lg transition-colors ${
            isFlagged ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400 hover:text-slate-600"
          }`}
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Code Snippet (from Question model, passed through API) */}
      {question.codeSnippet && (
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 mb-4 overflow-x-auto">
          <code className={`language-${question.language || "javascript"} text-sm font-mono`}>
            {question.codeSnippet}
          </code>
        </pre>
      )}

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectOption(index)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
              selectedOptionIndex === index
                ? "border-violet-500 bg-violet-50 text-violet-900"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}