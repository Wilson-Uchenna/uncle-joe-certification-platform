import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;           // "Developers (Web/Mobile/Software)"
  slug: string;           // "developers-web-mobile-software"
  description: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    roles: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for active filtering
CategorySchema.index({ isActive: 1 });

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;