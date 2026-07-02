import mongoose, { Schema, Document } from 'mongoose';

export type AttemptAction = 
  | 'started' 
  | 'answer_saved' 
  | 'navigated' 
  | 'tab_switched' 
  | 'refreshed' 
  | 'submitted' 
  | 'timed_out'
  | 'resumed';

export interface IExamAttempt extends Document {
  examId: mongoose.Types.ObjectId;
  betterAuthUserId: string;
  action: AttemptAction;
  questionIndex?: number;
  answerIndex?: number;
  metadata?: Record<string, any>;    // IP, user agent, etc.
  timestamp: Date;
}

const ExamAttemptSchema = new Schema<IExamAttempt>({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  betterAuthUserId: { type: String, required: true, index: true },
  action: { 
    type: String, 
    enum: ['started', 'answer_saved', 'navigated', 'tab_switched', 'refreshed', 'submitted', 'timed_out', 'resumed'],
    required: true 
  },
  questionIndex: Number,
  answerIndex: Number,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Anti-cheat analysis
ExamAttemptSchema.index({ examId: 1, action: 1, timestamp: 1 });

export default mongoose.models.ExamAttempt || mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema);