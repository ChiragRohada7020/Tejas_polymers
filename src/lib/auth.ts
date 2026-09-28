import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

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

/** Verify the submitted password against ADMIN_PASSWORD. */
export function verifyPassword(password: string): boolean {
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
