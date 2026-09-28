import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    country: { type: String, default: "" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, default: "" },
    message: { type: String, required: true },
    type: { type: String, enum: ["general", "distributor", "product"], default: "general", index: true },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new", index: true },
  },
  { timestamps: true }
);

export type Inquiry = InferSchemaType<typeof InquirySchema>;

export const Inquiry: Model<Inquiry> =
  mongoose.models.Inquiry ?? mongoose.model<Inquiry>("Inquiry", InquirySchema);
