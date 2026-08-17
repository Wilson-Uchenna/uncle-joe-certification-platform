import mongoose, { Schema, Document } from 'mongoose';

export type AttemptStatus =
  | 'in_progress'
  | 'completed'
  | 'terminated'
  | 'timed_out';

export type AttemptEndReason =
  | 'submitted'
  | 'timed_out'
  | 'tab_switched'
  | 'refreshed'
  | 'cheating_detected'
  | 'other';

export interface IExamAttempt extends Document {
  examId: mongoose.Types.ObjectId;
  betterAuthUserId: string;
  reason: AttemptEndReason;
  questionIndex?: number;
  answerIndex?: number;
  metadata?: Record<string, any>;    // IP, user agent, etc.
  timestamp: Date;
}

const ExamAttemptSchema = new Schema<IExamAttempt>({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  betterAuthUserId: { type: String, required: true, index: true },
  reason: { 
    type: String, 
    enum: ['submitted','timed_out','tab_switched','refreshed','cheating_detected','other'],
    required: true 
  },
  questionIndex: Number,
  answerIndex: Number,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Anti-cheat analysis
ExamAttemptSchema.index({ examId: 1, action: 1, timestamp: 1 });

export const ExamAttempt =
  mongoose.models.ExamAttempt || mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema);

  export default ExamAttempt;