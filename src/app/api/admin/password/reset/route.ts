import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ADMIN_CREDENTIAL_ID, AdminCredentialModel } from "@/lib/models/AdminCredential";
import { hashPassword, isValidOtpFormat, verifyOtpHash } from "@/lib/admin-password";

/**
 * Step 2 of the admin password reset: exchange a valid OTP for a new
 * password.
 *
 * The OTP is single-use - it is cleared whether or not the code was
 * correct, so a wrong guess cannot be brute-forced against the same
 * code. Attempts are also capped before the code is wiped.
 */

const MAX_OTP_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 10;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { otp?: string; newPassword?: string };
    const otp = (body.otp || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!isValidOtpFormat(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400 });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    await connectDB();
    const doc = await AdminCredentialModel.findById(ADMIN_CREDENTIAL_ID).lean();
    const storedHash = (doc as { otpHash?: string } | null)?.otpHash ?? "";
    const expiresAt = (doc as { otpExpiresAt?: Date | null } | null)?.otpExpiresAt ?? null;
    const attempts = (doc as { otpAttempts?: number } | null)?.otpAttempts ?? 0;

    const valid =
      Boolean(storedHash) &&
      expiresAt !== null &&
      expiresAt !== undefined &&
      new Date(expiresAt).getTime() > Date.now();

    if (!valid || attempts >= MAX_OTP_ATTEMPTS || !(await verifyOtpHash(otp, storedHash))) {
      // Burn the code on any failure so guesses cannot be repeated.
      await AdminCredentialModel.updateOne(
        { _id: ADMIN_CREDENTIAL_ID },
        { $set: { otpHash: "", otpExpiresAt: null, otpAttempts: attempts + 1 } }
      );
      return NextResponse.json(
        { error: "That code is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const { hash, salt } = await hashPassword(newPassword);
    await AdminCredentialModel.updateOne(
      { _id: ADMIN_CREDENTIAL_ID },
      {
        $set: {
          passwordHash: hash,
          passwordSalt: salt,
          passwordUpdatedAt: new Date(),
          // Single use.
          otpHash: "",
          otpExpiresAt: null,
          otpAttempts: 0,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Password reset failed:", err);
    return NextResponse.json({ error: "Could not reset the password." }, { status: 500 });
  }
}