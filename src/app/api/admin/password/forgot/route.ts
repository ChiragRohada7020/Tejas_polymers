import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ADMIN_CREDENTIAL_ID, AdminCredentialModel } from "@/lib/models/AdminCredential";
import { generateOtp, hashOtp } from "@/lib/admin-password";
import { adminAlertEmail, isMailConfigured, sendAdminOtp } from "@/lib/mailer";

/**
 * Step 1 of the admin password reset: email a one-time code.
 *
 * The code is only ever sent to the configured owner inbox - never to
 * an address supplied by the request - so this cannot be used to send
 * mail to arbitrary third parties.
 */

const OTP_TTL_MINUTES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

/** Responses are deliberately identical whether or not SMTP is set up. */
const GENERIC_RESPONSE = {
  ok: true,
  message: `If the admin inbox is configured, a ${OTP_TTL_MINUTES}-minute verification code has been sent.`,
};

export async function POST() {
  if (!isMailConfigured()) {
    console.warn("Password reset requested but SMTP is not configured.");
    return NextResponse.json(GENERIC_RESPONSE);
  }

  await connectDB();

  // Rate limit on the stored timestamp, so this works without any
  // shared in-memory store (which would not survive serverless reuse).
  const now = Date.now();
  const doc = await AdminCredentialModel.findById(ADMIN_CREDENTIAL_ID).lean();
  const prevCount = (doc as { otpRequestCount?: number } | null)?.otpRequestCount ?? 0;
  const prevWindowStart = (doc as { otpWindowStart?: Date } | null)?.otpWindowStart;

  const withinWindow = prevWindowStart && now - new Date(prevWindowStart).getTime() < WINDOW_MS;
  if (withinWindow && prevCount >= MAX_REQUESTS_PER_WINDOW) {
    // Still answer generically so we do not leak whether mail is sent.
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  await AdminCredentialModel.updateOne(
    { _id: ADMIN_CREDENTIAL_ID },
    {
      $set: {
        otpHash,
        otpExpiresAt: new Date(now + OTP_TTL_MINUTES * 60 * 1000),
        otpAttempts: 0,
        otpSentAt: new Date(now),
        otpRequestCount: withinWindow ? prevCount + 1 : 1,
        otpWindowStart: withinWindow ? prevWindowStart : new Date(now),
      },
    },
    { upsert: true }
  );

  const result = await sendAdminOtp(otp, OTP_TTL_MINUTES);
  if (!result.sent) {
    console.error("Admin OTP email failed:", result.error);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}