// models/StudyResourcesAccess.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStudyResourcesAccess extends Document {
  user: mongoose.Types.ObjectId;
  type: "pdf_materials" | "past_questions";
  paymentReference: string;
  grantedAt: Date;
}

const StudyResourcesAccessSchema = new Schema<IStudyResourcesAccess>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["pdf_materials", "past_questions"], required: true },
    paymentReference: { type: String, required: true },
    grantedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

StudyResourcesAccessSchema.index({ user: 1, type: 1 }, { unique: true });

export const StudyResourcesAccess =
  mongoose.models.StudyResourcesAccess ||
  mongoose.model<IStudyResourcesAccess>("StudyResourcesAccess", StudyResourcesAccessSchema);

export default StudyResourcesAccess;