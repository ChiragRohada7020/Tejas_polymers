import mongoose, { Schema, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    rank: { type: Number, default: 999, index: true },
    specs: { type: Schema.Types.Mixed, default: {} },
    price: { type: String, default: "" },
    minOrderQty: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", shortDescription: "text", category: "text" });

export interface IProduct {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
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
