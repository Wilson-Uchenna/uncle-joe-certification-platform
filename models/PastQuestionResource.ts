// models/PastQuestionResource.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPastQuestionResource extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  publicId: string;
  originalFileName: string;
  fileSize?: number;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  skillLevel: "entry" | "mid" | "advanced";
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const PastQuestionResourceSchema = new Schema<IPastQuestionResource>(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: Number,
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    skillLevel: { type: String, enum: ["entry", "mid", "advanced"], required: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PastQuestionResourceSchema.index({ categoryId: 1, skillLevel: 1, isPublished: 1 });

export const PastQuestionResource =
  mongoose.models.PastQuestionResource ||
  mongoose.model<IPastQuestionResource>("PastQuestionResource", PastQuestionResourceSchema);

export default PastQuestionResource;