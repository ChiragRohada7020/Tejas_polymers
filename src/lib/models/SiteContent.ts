import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * One row per (key, locale).
 *
 * The unique constraint is on the PAIR, not on `key` alone - that is what
 * lets "home.heroTitle" exist once in Marathi and once in English. The
 * original single-column unique index on `key` has to be dropped before this
 * schema can save anything, which `npm run i18n:migrate` handles.
 */
const SiteContentSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, index: true },
    value: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["text", "rich", "image", "link"],
      default: "text",
      index: true,
    },
    /**
     * Rows that predate bilingual editing hold English copy, so the
     * migration stamps those "en" rather than letting the schema default
     * misfile them as Marathi. The default only applies to genuinely new
     * writes and matches the public-facing default locale.
     */
    locale: {
      type: String,
      enum: ["mr", "en"],
      default: DEFAULT_LOCALE,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

SiteContentSchema.index({ key: 1, locale: 1 }, { unique: true });

export type SiteContent = InferSchemaType<typeof SiteContentSchema>;

export const SiteContent: Model<SiteContent> =
  mongoose.models.SiteContent ?? mongoose.model<SiteContent>("SiteContent", SiteContentSchema);
