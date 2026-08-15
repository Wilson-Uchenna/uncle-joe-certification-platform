export interface IResultBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

// types/results.ts
export interface ResultData {
  _id: string;
  examId: string;
  userId: string;
  userName: string;
  categoryName: string;
  skillLevel: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  breakdown: IResultBreakdown[];
  categoryRank?: number;
  overallRank?: number;
  stateRank?: number;
  certificateAvailable: boolean;
  certificateDownloaded: boolean;
  certificatePaidAt?: string;
  shareUrl?: string;
  isPublic: boolean;
  createdAt: string;
  
  // NEW
  resultsAvailableAt: string; // ISO date string
}

export type PerformanceLevel = 
  | "outstanding"      // 90-100%
  | "passed"           // 70-89% (passed)
  | "good_attempt"     // 50-69% (failed)
  | "needs_improvement" // 0-49% (failed)
  | "completed";       // fallback

export function getPerformanceLevel(score: number, passed: boolean): PerformanceLevel {
  if (score >= 90) return "outstanding";
  if (passed) return "passed";
  if (score >= 50) return "good_attempt";
  return "needs_improvement";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Below Passing";
}