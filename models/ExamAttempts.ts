import mongoose, { Schema, Document } from "mongoose";

export type AttemptStatus = "in_progress" | "completed" | "terminated";

export type AttemptEndReason =
  | "submitted"
  | "timed_out"
  | "tab_switched"
  | "cheating_detected"
  | "abandoned";

export interface IExamAttempt extends Document {
  userId: string;
  categoryId: mongoose.Types.ObjectId;
  skillLevel: "entry" | "mid" | "advanced";
  examId?: mongoose.Types.ObjectId; // linked once the Exam doc for this attempt exists
  status: AttemptStatus;
  endReason?: AttemptEndReason;
  startedAt: Date;
  endedAt?: Date;
}

const ExamAttemptSchema = new Schema<IExamAttempt>({
  userId: { type: String, required: true, index: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  skillLevel: {
    type: String,
    enum: ["entry", "mid", "advanced"],
    required: true,
  },
  examId: { type: Schema.Types.ObjectId, ref: "Exam" },
  status: {
    type: String,
    enum: ["in_progress", "completed", "terminated"],
    default: "in_progress",
    required: true,
  },
  endReason: {
    type: String,
    enum: ["submitted", "timed_out", "tab_switched", "cheating_detected", "abandoned"],
  },
  startedAt: { type: Date, default: Date.now, required: true },
  endedAt: Date,
});

// Fast lookup: "does this user have an open or recent attempt for this category/level?"
ExamAttemptSchema.index({ userId: 1, categoryId: 1, skillLevel: 1, startedAt: -1 });
// Fast lookup: is there currently an in-progress attempt (should be at most one)?
ExamAttemptSchema.index({ userId: 1, status: 1 });

export const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema);

export default ExamAttempt;