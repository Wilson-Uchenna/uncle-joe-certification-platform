// components/PastQuestionReview.tsx
"use client";

const LETTERS = ["A", "B", "C", "D"];

interface ExamQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer?: number;
}

interface ExamReview {
  categoryName: string;
  skillLevel: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  questions: ExamQuestion[];
}

export function PastQuestionReview({ exam }: { exam: ExamReview }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ margin: 0 }}>
          {exam.categoryName} — {exam.skillLevel}
        </h2>
        <p style={{ color: "#666" }}>
          Score: {exam.score}% ({exam.correctCount}/{exam.totalQuestions})
        </p>
      </div>

      {exam.questions.map((q, i) => (
        <div key={i} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>
            {i + 1}. {q.questionText}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, idx) => {
              const isCorrect = idx === q.correctAnswer;
              const isYourWrongPick = idx === q.selectedAnswer && !isCorrect;

              return (
                <div
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: isCorrect
                      ? "2px solid #2e7d32"
                      : isYourWrongPick
                      ? "2px solid #c62828"
                      : "1px solid #ddd",
                    background: isCorrect ? "#eaf7ea" : isYourWrongPick ? "#fdeaea" : "transparent",
                  }}
                >
                  {LETTERS[idx]}. {opt}
                  {isCorrect && " ✓ Correct answer"}
                  {isYourWrongPick && " ← Your answer"}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}