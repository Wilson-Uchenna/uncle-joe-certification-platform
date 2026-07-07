import mongoose, { Schema, Document } from "mongoose";

export interface IResultBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface IResult extends Document {
  examId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: String;

  // Display data
  categoryName: string;
  skillLevel: string;

  // Scores
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;

  // Breakdown (for detailed view)
  breakdown: IResultBreakdown[];

  // Rankings at time of result
  categoryRank?: number;
  overallRank?: number;
  stateRank?: number;

  // Certificate
  certificateAvailable: boolean;
  certificateDownloaded: boolean;

  // Sharing
  shareUrl?: string;
  isPublic: boolean;
  resultsAvailableAt: Date; // When the results become available to the user (embargo)

  createdAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      unique: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    categoryName: { type: String, required: true },
    skillLevel: { type: String, required: true },

    score: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    passed: { type: Boolean, required: true },

    breakdown: [
      {
        category: String,
        correct: Number,
        total: Number,
        percentage: Number,
      },
    ],

    categoryRank: Number,
    overallRank: Number,
    stateRank: Number,

    certificateAvailable: { type: Boolean, default: false },
    certificateDownloaded: { type: Boolean, default: false },
    resultsAvailableAt: { type: Date, required: true },

    shareUrl: String,
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Fast lookups
ResultSchema.index({ betterAuthUserId: 1, createdAt: -1 });
ResultSchema.index({ examId: 1 });
ResultSchema.index({ passed: 1, certificateAvailable: 1 });

export const Result =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);
export default Result;
