import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof CategorySchema>;

export const Category: Model<Category> =
  mongoose.models.Category ?? mongoose.model<Category>("Category", CategorySchema);
