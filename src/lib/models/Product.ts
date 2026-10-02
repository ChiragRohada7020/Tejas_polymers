import mongoose, { Schema, type Model } from "mongoose";

/**
 * Marathi copy for a product.
 *
 * A nested object rather than `nameMr`/`descriptionMr` columns so adding a
 * third language later is a schema and content change, not another set of
 * columns. Everything is optional: `localizeProduct()` falls back to the
 * English field whenever a Marathi one is missing, so a partially
 * translated catalogue still renders completely instead of showing blanks.
 */
const ProductMrSchema = new Schema(
  {
    name: { type: String, default: "", trim: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true },
    mr: { type: ProductMrSchema, default: () => ({}) },
    imageUrl: { type: String, default: "" },
    rank: { type: Number, default: 999, index: true },
    /**
     * Spec VALUES are numbers and units (5000 m, 4 LPH) and stay
     * language-neutral. Spec KEYS are admin-authored free text and are
     * deliberately not translated here - see README i18n notes.
     */
    specs: { type: Schema.Types.Mixed, default: {} },
    price: { type: String, default: "" },
    minOrderQty: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", shortDescription: "text", category: "text" });
// Marathi is indexed too, so a Marathi search term can match a product that
// has only ever been translated in the admin UI.
ProductSchema.index({ "mr.name": "text", "mr.shortDescription": "text" });

export interface IProductMr {
  name?: string;
  shortDescription?: string;
  description?: string;
}

export interface IProduct {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  mr?: IProductMr;
  imageUrl: string;
  rank: number;
  specs: Record<string, string>;
  price: string;
  minOrderQty: string;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);
