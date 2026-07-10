import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  categoryId: mongoose.Types.ObjectId;
  role: string;
  skillLevel: "entry" | "mid" | "advanced";
  question: string;
  codeSnippet?: string;
  language?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  isFinalStage: boolean;
  isActive: boolean;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    role: { type: String, required: true },
    skillLevel: {
      type: String,
      enum: ["entry", "mid", "advanced"],
      required: true,
    },
    question: { type: String, required: true },
    codeSnippet: { type: String },
    language: { type: String, default: "javascript" },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: "" },
    isFinalStage: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ categoryId: 1, role: 1, skillLevel: 1, isActive: 1 });
QuestionSchema.index({ isFinalStage: 1 });

export const Question =
  mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);