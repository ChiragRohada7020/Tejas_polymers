import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

/**
 * Password + OTP hashing for the admin account.
 *
 * Uses scrypt from the Node standard library rather than pulling in
 * bcrypt: it is memory-hard, ships with no extra dependency, and is
 * more than adequate for a single admin credential.
 *
 * A malformed stored hash is treated as "no password" rather than
 * throwing, so corrupt data cannot lock you out of your own panel with
 * a 500.
 */

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEYLEN);
  return { hash: derived.toString("base64"), salt: salt.toString("base64") };
}

export async function verifyPasswordHash(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  if (!hash || !salt) return false;
  try {
    const derived = await scryptAsync(password, Buffer.from(salt, "base64"), KEYLEN);
    const expected = Buffer.from(hash, "base64");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** 6-digit numeric code from a CSPRNG, avoiding values with leading zeros. */
export function generateOtp(): string {
  return String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

export async function hashOtp(otp: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(otp, salt, 32);
  return `${salt.toString("base64")}.${derived.toString("base64")}`;
}

export async function verifyOtpHash(otp: string, stored: string): Promise<boolean> {
  if (!stored || !stored.includes(".")) return false;
  const [saltB64, hashB64] = stored.split(".");
  try {
    const derived = await scryptAsync(otp, Buffer.from(saltB64, "base64"), 32);
    const expected = Buffer.from(hashB64, "base64");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function isValidOtpFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}