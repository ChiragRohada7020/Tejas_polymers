import nodemailer, { type Transporter } from "nodemailer";
import { SITE_NAME } from "@/lib/site";
import { inquiryAutoReply, inquiryNotification, type InquiryData } from "@/lib/emails/inquiry";
import { adminOtpEmail } from "@/lib/emails/admin-otp";

/**
 * Gmail SMTP transport.
 *
 * Requires a Google APP PASSWORD, not the account password. Enable
 * 2-Step Verification first, then create one under
 * Google Account -> Security -> App passwords.
 *
 * The app password is copied with spaces ("abcd efgh ..."), which Gmail
 * accepts, so we strip whitespace here rather than making the operator
 * remember to.
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

/** Where enquiry notifications are delivered. */
const NOTIFY_TO = process.env.SMTP_NOTIFY_TO || SMTP_USER;

/** Never send to yourself: auto-replies only go to the submitter. */
function isSelf(address: string): boolean {
  return address.toLowerCase() === SMTP_USER.toLowerCase();
}

export function isMailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS && NOTIFY_TO);
}

const globalCache = globalThis as unknown as { mailerTransport?: Transporter };

function getTransport(): Transporter {
  if (globalCache.mailerTransport) return globalCache.mailerTransport;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    // Port 465 uses implicit TLS; everything else upgrades via STARTTLS.
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Reuse the connection across hot reloads in development.
  globalCache.mailerTransport = transporter;
  return transporter;
}

/** Fail fast instead of hanging a request when Gmail is unreachable. */
const TIMEOUT_MS = 12_000;

async function send(options: Parameters<Transporter["sendMail"]>[0]): Promise<void> {
  const transport = getTransport();
  await Promise.race([
    transport.sendMail(options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP send timed out")), TIMEOUT_MS)
    ),
  ]);
}

export type SendResult = { sent: boolean; error?: string };

/**
 * Email the business owner about a new inquiry.
 * Never throws - a failed notification must not break the form.
 */
export async function notifyNewInquiry(data: InquiryData): Promise<SendResult> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP is not configured (SMTP_USER / SMTP_PASS)" };
  }
  try {
    const { subject, html, text } = inquiryNotification(data);
    await send({
      from: `"Krusheebindoo Website" <${SMTP_USER}>`,
      to: NOTIFY_TO,
      // Replying straight to the sender is the most useful default.
      replyTo: data.email,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Unknown SMTP error" };
  }
}

/** Confirm receipt to the person who submitted the form. Never throws. */
export async function sendInquiryAutoReply(data: InquiryData): Promise<SendResult> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP is not configured (SMTP_USER / SMTP_PASS)" };
  }
  // Guard against mailing the business itself if it ever fills the form in.
  if (isSelf(data.email)) return { sent: true };

  try {
    const { subject, html, text } = inquiryAutoReply(data);
    await send({
      from: `"Krusheebindoo" <${SMTP_USER}>`,
      to: data.email,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Unknown SMTP error" };
  }
}
/**
 * Send the password-reset OTP to the account owner's inbox.
 *
 * Always sends to the configured ADMIN_ALERT_EMAIL (falling back to
 * SMTP_USER) rather than to anything supplied by the caller, so this
 * can never be turned into an open mail relay.
 */
export async function sendAdminOtp(
  otp: string,
  expiresInMinutes: number
): Promise<SendResult> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP is not configured (SMTP_USER / SMTP_PASS)" };
  }
  const to = process.env.ADMIN_ALERT_EMAIL || SMTP_USER;
  try {
    const { subject, html, text } = adminOtpEmail(otp, expiresInMinutes);
    await send({
      from: `"${SITE_NAME}" <${SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Unknown SMTP error" };
  }
}

/** Inbox that receives admin security notifications. */
export function adminAlertEmail(): string {
  return process.env.ADMIN_ALERT_EMAIL || SMTP_USER;
}