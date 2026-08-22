import mongoose, { Schema, Document } from "mongoose";

export type AttemptStatus = "in_progress" | "completed" | "terminated";

export type AttemptEndReason =
  | "submitted"
  | "timed_out"
  | "tab_switched"
  | "cheating_detected"
  | "abandoned";

export interface IAttemptEntry {
  examId: mongoose.Types.ObjectId;
  attemptNumber: number;
  status: AttemptStatus;
  endReason?: AttemptEndReason;
  startedAt: Date;
  endedAt?: Date;
}

export interface IExamAttempt extends Document {
  userId: string;
  categoryId: mongoose.Types.ObjectId;
  skillLevel: "entry" | "mid" | "advanced";
  attempts: IAttemptEntry[];
}

const AttemptEntrySchema = new Schema<IAttemptEntry>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    attemptNumber: { type: Number, required: true },
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
    startedAt: { type: Date, required: true },
    endedAt: Date,
  },
  { _id: false },
);

const ExamAttemptSchema = new Schema<IExamAttempt>({
  userId: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  skillLevel: {
    type: String,
    enum: ["entry", "mid", "advanced"],
    required: true,
  },
  attempts: [AttemptEntrySchema],
});

// One document per user+category+skillLevel — enforced at the DB level
ExamAttemptSchema.index(
  { userId: 1, categoryId: 1, skillLevel: 1 },
  { unique: true },
);

export const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema);

export default ExamAttempt;