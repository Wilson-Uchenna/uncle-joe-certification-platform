import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  categoryId: mongoose.Types.ObjectId;
  question: string;
  options: string[];               // 4 options
  correctAnswer: number;           // Index 0-3
  explanation?: string;              // For training materials
  difficulty: number;              // 1-5
  isFinalStage: boolean; // Only for final exam
  role?: string; // Optional sub-role assignment
  timesUsed: number;               // Analytics
  timesCorrect: number;            // Analytics (for difficulty adjustment)
  isActive: boolean;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true 
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: String,
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  isFinalStage: { type: Boolean, default: false, index: true },
  role: { type: String, default: null, index: true }, // NEW
  timesUsed: { type: Number, default: 0 },
  timesCorrect: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Critical index for exam generation
QuestionSchema.index({ categoryId: 1, role: 1, isFinalStage: 1, isActive: 1 });

export const Question =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;;