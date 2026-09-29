import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Admin password and password-reset OTPs.
 *
 * The password used to live only in the ADMIN_PASSWORD env var, which
 * meant it could not be changed on a serverless host without a
 * redeploy. Storing a scrypt hash here makes the OTP reset real: the
 * database value wins, and the env var is only a bootstrap fallback.
 *
 * A single document is used (singleton), so there is never more than
 * one active OTP to reason about.
 */

/** Stable id so every call targets the same document. */
export const ADMIN_CREDENTIAL_ID = "singleton";

const AdminCredentialSchema = new Schema(
  {
    // Fixed string id. Mongoose casts _id to ObjectId by default, which
    // would reject "singleton", so it is declared as an explicit String.
    _id: { type: String, default: ADMIN_CREDENTIAL_ID },

    // scrypt parameters + derived key, both base64 encoded.
    passwordHash: { type: String, default: "" },
    passwordSalt: { type: String, default: "" },

    // Currently outstanding password-reset OTP. The raw code is never
    // stored - only a salted scrypt hash of it.
    otpHash: { type: String, default: "" },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },

    // Throttling for the "email me a code" endpoint. Kept in the
    // database because serverless instances do not share memory.
    otpSentAt: { type: Date, default: null },
    otpWindowStart: { type: Date, default: null },
    otpRequestCount: { type: Number, default: 0 },

    // When the password was last changed.
    passwordUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type AdminCredential = InferSchemaType<typeof AdminCredentialSchema>;

export const AdminCredentialModel: Model<AdminCredential> =
  mongoose.models.AdminCredential ??
  mongoose.model<AdminCredential>("AdminCredential", AdminCredentialSchema);