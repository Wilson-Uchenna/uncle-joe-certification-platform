// models/ResourcePurchase.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IResourcePurchase extends Document {
  user: mongoose.Types.ObjectId;
  resourceType: "explanation" | "past_question";
  resourceId: string; // ExplanationResource._id, or Exam._id for a review
  paymentReference: string;
  grantedAt: Date;
}

const ResourcePurchaseSchema = new Schema<IResourcePurchase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resourceType: { type: String, enum: ["explanation", "past_question"], required: true },
    resourceId: { type: String, required: true },
    paymentReference: { type: String, required: true },
    grantedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One purchase per user per specific resource — prevents double-charging for the same PDF/review
ResourcePurchaseSchema.index({ user: 1, resourceType: 1, resourceId: 1 }, { unique: true });

export const ResourcePurchase =
  mongoose.models.ResourcePurchase ||
  mongoose.model<IResourcePurchase>("ResourcePurchase", ResourcePurchaseSchema);

export default ResourcePurchase;