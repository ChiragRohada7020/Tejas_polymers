import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    /** Marathi category name; falls back to `name` until translated. */
    nameMr: { type: String, default: "", trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof CategorySchema>;

/** Display name for a category in the given locale, with English fallback. */
export function categoryName(
  category: { name: string; nameMr?: string } | null,
  locale: string
): string {
  if (!category) return "";
  if (locale === "mr" && category.nameMr && category.nameMr.trim()) {
    return category.nameMr;
  }
  return category.name;
}

export const Category: Model<Category> =
  mongoose.models.Category ?? mongoose.model<Category>("Category", CategorySchema);
