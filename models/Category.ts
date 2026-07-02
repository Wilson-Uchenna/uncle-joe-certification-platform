import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string; // "Digital Literacy"
  slug: string; // "digital-literacy"
  skillLevel: "entry" | "mid" | "advanced";
  description: string;
  examTimeLimit: number; // Minutes (15 for regular, 8 for final)
  passThreshold: number; // Percentage (default 60%)
  isActive: boolean;
  roles: [];
  createdAt: Date;
}

 const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    skillLevel: {
      type: String,
      enum: ["entry", "mid", "advanced"],
      required: true,
    },
    description: { type: String, required: true },

    examTimeLimit: { type: Number, default: 15 },
    passThreshold: { type: Number, default: 60 },
    roles: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index for filtering
CategorySchema.index({ skillLevel: 1, isActive: 1 });

export const Category =  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category
