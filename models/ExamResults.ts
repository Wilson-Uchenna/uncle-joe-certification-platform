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
  userName: string;
  categoryName: string;
  skillLevel: string;
  selectedRole: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  breakdown: IResultBreakdown[];
  categoryRank?: number;
  overallRank?: number;
  stateRank?: number;
  certificateAvailable: boolean;
  resultsPaidAt?: Date;
  certificatePaidAt: Date;
  certificateDownloaded: boolean;
  certificateStatus: {
    type: String;
    enum: ["pending", "approved", "rejected"];
    default: "pending";
  };
  certificateApprovedAt: Date;
  certificateApprovedBy: String; // admin user id
  certificateRejectedAt: Date;
  certificateRejectedBy: String; // admin user id
  shareUrl?: string;
  isPublic: boolean;
  resultsAvailableAt: Date;
   resultEmailSentAt?: Date;
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
    selectedRole: { type: String },

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
    certificatePaidAt: Date,
     resultsPaidAt: { type: Date, default: null },
    certificateDownloaded: { type: Boolean, default: false },
    certificateStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      
    },
    certificateApprovedAt: Date,
    certificateApprovedBy: String, // admin user id
    certificateRejectedAt: Date,
    certificateRejectedBy: String, // admin user id
    resultsAvailableAt: { type: Date, required: true },
    resultEmailSentAt: Date,

    shareUrl: String,
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// All indexes defined here only
ResultSchema.index({ userId: 1, createdAt: -1 });
ResultSchema.index({
  certificateAvailable: 1,
  certificateStatus: 1,
  createdAt: -1,
});

export const Result =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);
export default Result;
