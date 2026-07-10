import mongoose, { Schema, Document } from "mongoose";

export interface IExamQuestion {
  questionId: mongoose.Types.ObjectId;
  questionText: string;
  options: string[];
  selectedAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

export type ExamStatus =
  | "in_progress"
  | "completed"
  | "timed_out"
  | "abandoned";

export interface IExam extends Document {
  userId: string;
  userName: string;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  skillLevel: "entry" | "mid" | "advanced";
  isFinalStage: boolean;
  selectedRole: string;
  questions: IExamQuestion[];
  totalQuestions: number;
  correctCount: number;
  score: number;
  timeLimit: number; // 25 entry | 30 mid | 45 advanced
  timeUsed: number;
  startedAt: Date;
  completedAt?: Date;
  status: ExamStatus;
  passed: boolean;
  certificateDownloaded: boolean;
  certificateUrl?: string;
  certificatePaidAt?: Date;
  qualifiesForFinals: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamQuestionSchema = new Schema<IExamQuestion>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: { type: Number, default: 0 },
  },
  { _id: false },
);

const ExamSchema = new Schema<IExam>(
  {
    userId: { type: String, required: true },
    userName: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: { type: String, required: true },
    skillLevel: {
      type: String,
      enum: ["entry", "mid", "advanced"],
      required: true,
    },
    isFinalStage: { type: Boolean, default: false },
    selectedRole: { type: String, required: true, index: true },

    questions: [ExamQuestionSchema],
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 100 },

    timeLimit: { type: Number, required: true },
    timeUsed: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,

    status: {
      type: String,
      enum: ["in_progress", "completed", "timed_out", "abandoned"],
      default: "in_progress",
    },
    passed: { type: Boolean, default: false },

    certificateDownloaded: { type: Boolean, default: false },
    certificateUrl: String,
    certificatePaidAt: Date,

    qualifiesForFinals: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-set timeLimit based on skillLevel before validation
ExamSchema.pre<IExam>("validate", function (this: IExam) {
  const timeLimits: Record<IExam["skillLevel"], number> = {
    entry: 25,
    mid: 30,
    advanced: 45,
  };

  if (this.skillLevel && timeLimits[this.skillLevel]) {
    this.timeLimit = timeLimits[this.skillLevel];
  }
});

// All indexes defined here only
ExamSchema.index({ userId: 1 });
ExamSchema.index({ categoryId: 1 });
ExamSchema.index({ isFinalStage: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ categoryId: 1, score: -1, timeUsed: 1 });
ExamSchema.index({ userId: 1, categoryId: 1, status: 1 });
ExamSchema.index({
  passed: 1,
  certificateDownloaded: 1,
  qualifiesForFinals: 1,
});

export const Exam =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
export default Exam;
