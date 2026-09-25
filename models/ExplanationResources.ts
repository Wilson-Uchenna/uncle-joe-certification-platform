// models/ExplanationResource.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IExplanationResource extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  publicId: string;
  fileSize?: number;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  skillLevel: "entry" | "mid" | "advanced";
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const ExplanationResourceSchema = new Schema<IExplanationResource>(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: Number,
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    skillLevel: { type: String, enum: ["entry", "mid", "advanced"], required: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ExplanationResourceSchema.index({ categoryId: 1, skillLevel: 1, isPublished: 1 });

export const ExplanationResource =
  mongoose.models.ExplanationResource ||
  mongoose.model<IExplanationResource>("ExplanationResource", ExplanationResourceSchema);

export default ExplanationResource;