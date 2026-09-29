import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { verifyPasswordHash } from "@/lib/admin-password";

const COOKIE_NAME = "agrigrid_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "insecure-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Verify a submitted password against the administrator account.
 *
 * The database credential is authoritative, because that is what the
 * "forgot password" OTP flow writes to - an env var cannot be changed
 * at runtime on a serverless host. ADMIN_PASSWORD is kept purely as a
 * bootstrap fallback for a brand-new install, and is ignored as soon as
 * a password has been set in the database.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const { connectDB } = await import("@/lib/db");
  const { AdminCredentialModel, ADMIN_CREDENTIAL_ID } = await import(
    "@/lib/models/AdminCredential"
  );

  await connectDB();
  const doc = await AdminCredentialModel.findById(ADMIN_CREDENTIAL_ID).lean();
  const hash = (doc as { passwordHash?: string } | null)?.passwordHash ?? "";
  const salt = (doc as { passwordSalt?: string } | null)?.passwordSalt ?? "";

  if (hash && salt) {
    return verifyPasswordHash(password, hash, salt);
  }

  // No password set in the database yet: fall back to the env var.
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(password, expected);
}

/** Create a signed session token valid for MAX_AGE_SECONDS. */
export function createSessionToken(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expires, sig] = parts;
  if (role !== "admin") return false;
  if (!sign(`${role}.${expires}`).length || sig !== sign(`${role}.${expires}`)) return false;
  return Number(expires) > Date.now();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
};