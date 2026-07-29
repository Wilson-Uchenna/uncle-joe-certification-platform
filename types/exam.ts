export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  roles: string[];
  examTimeLimit: number;
  passThreshold: number;
}

export interface Option {
  _id: string;
  text: string;
}

export interface Question {
  _id: string;
  text: string;
  options: Option[];
}

// API response types
export interface ExamStartResponse {
  success: boolean;
  examId: string;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
  timeLimit: number;
  totalQuestions: number;
}

export interface ExamSubmitResponse {
  success: boolean;
  examId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  certificateAvailable: boolean;
  resultsAvailableAt: Date;
}

export interface ExamState {
  examId: string;
  currentQuestion: number;
  answers: Record<number, number>; // questionIndex -> optionIndex
  flagged: number[]; // question indices
  timeRemaining: number;
  submitted: boolean;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
}