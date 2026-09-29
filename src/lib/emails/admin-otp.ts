import { SITE_NAME } from "@/lib/site";

/**
 * OTP email for the admin password reset.
 *
 * Same constraints as the inquiry templates: table layout, inline
 * styles only, no <style> block, no flexbox/grid, and a plain-text
 * alternative for Gmail/Outlook.
 */

const GREEN = "#2d7352";
const GREEN_DARK = "#1c3c2e";
const GOLD = "#e8a020";
const SLATE = "#475569";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function adminOtpEmail(otp: string, expiresInMinutes: number): {
  subject: string;
  html: string;
  text: string;
} {
  const digits = otp.split("").map(
    (d) =>
      `<td align="center" style="background:#f0f9f4;border:1px solid ${BORDER};border-radius:10px;width:58px;height:66px;font-size:32px;font-weight:700;color:${GREEN_DARK};font-family:'Courier New',monospace;">${escapeHtml(d)}</td>`
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Your ${SITE_NAME} admin verification code</title>
</head>
<body style="margin:0;padding:0;background:${BG};-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:${GREEN_DARK};padding:22px 24px;">
            <div style="font-size:19px;font-weight:700;color:#ffffff;">${SITE_NAME}</div>
            <div style="font-size:12px;color:#a7c9b6;margin-top:2px;">Admin panel</div>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 24px 8px 24px;">
            <h1 style="margin:0 0 10px 0;font-size:21px;color:${GREEN_DARK};line-height:1.3;">Your verification code</h1>
            <p style="margin:0;font-size:15px;line-height:1.75;color:#334155;">Use the code below to reset your administrator password. It is valid for <strong style="color:${GREEN_DARK};">${expiresInMinutes} minutes</strong> and can only be used once.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:0 5px;">${digits[0]}</td>
                <td style="padding:0 5px;">${digits[1]}</td>
                <td style="padding:0 5px;">${digits[2]}</td>
                <td style="padding:0 5px;">${digits[3]}</td>
                <td style="padding:0 5px;">${digits[4]}</td>
                <td style="padding:0 5px;">${digits[5]}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 24px 20px 24px;">
            <div style="background:#fffbeb;border-left:3px solid ${GOLD};border-radius:6px;padding:13px 15px;font-size:13px;line-height:1.7;color:#78350f;">
              <strong>Did not request this?</strong> You can safely ignore this email. The code only works if you enter it on the admin login page, and no password changes without it.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 26px 24px;font-size:13px;line-height:1.7;color:${SLATE};">
            Never share this code with anyone, including anyone claiming to be from ${SITE_NAME}.
          </td>
        </tr>
        <tr>
          <td style="background:${BG};padding:18px 24px;border-top:1px solid ${BORDER};font-size:12px;color:${SLATE};">
            ${SITE_NAME} - administrator account security
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `Your ${SITE_NAME} admin verification code`,
    "",
    `Code: ${otp}`,
    "",
    `Valid for ${expiresInMinutes} minutes. Single use.`,
    "",
    "If you did not request this, you can safely ignore this email.",
    `Never share this code with anyone, including anyone claiming to be from ${SITE_NAME}.`,
  ].join("\n");

  return { subject: `Your ${SITE_NAME} admin verification code`, html, text };
}