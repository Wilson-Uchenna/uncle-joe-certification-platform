import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingMaterial extends Document {
  categoryId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'past_questions' | 'study_guide' | 'video' | 'ebook';
  price: number;                           // In kobo
  currency: string;
  fileUrl?: string;
  fileSize?: number;
  pageCount?: number;
  questionCount?: number;                  // For past questions
  sampleUrl?: string;                      // Free preview
  isFree: boolean;
  isActive: boolean;
  purchaseCount: number;
  createdAt: Date;
}

const TrainingMaterialSchema = new Schema<ITrainingMaterial>({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['past_questions', 'study_guide', 'video', 'ebook'], 
    required: true 
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  fileUrl: String,
  fileSize: Number,
  pageCount: Number,
  questionCount: Number,
  sampleUrl: String,
  isFree: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  purchaseCount: { type: Number, default: 0 },
}, { timestamps: true });

export const TrainingMaterial =
  mongoose.models.TrainingMaterial || mongoose.model<ITrainingMaterial>('TrainingMaterial', TrainingMaterialSchema);
export default TrainingMaterial;