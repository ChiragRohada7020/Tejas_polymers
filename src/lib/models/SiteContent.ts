import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SiteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    value: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["text", "rich", "image", "link"],
      default: "text",
      index: true,
    },
  },
  { timestamps: true }
);

export type SiteContent = InferSchemaType<typeof SiteContentSchema>;

export const SiteContent: Model<SiteContent> =
  mongoose.models.SiteContent ?? mongoose.model<SiteContent>("SiteContent", SiteContentSchema);
