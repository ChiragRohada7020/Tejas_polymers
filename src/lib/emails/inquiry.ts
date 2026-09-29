import { BRAND_NAME, CONTACT, SITE_NAME } from "@/lib/site";

/**
 * Email templates for the inquiry flow.
 *
 * Email clients are a hostile environment: most of them ignore <style>
 * blocks, and none of the mainstream ones support flexbox or grid. So
 * every rule here is INLINE and layout is table-based. Keep it that way
 * if you edit these - moving a rule into a stylesheet will silently
 * break Outlook and older Gmail.
 */

export type InquiryType = "general" | "distributor" | "product";

export type InquiryData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  productName?: string;
  message: string;
  type: InquiryType;
  createdAt?: Date;
};

const GREEN = "#2d7352";
const GREEN_DARK = "#1c3c2e";
const GOLD = "#e8a020";
const SLATE = "#475569";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";

const TYPE_META: Record<InquiryType, { label: string; bg: string; fg: string }> = {
  distributor: { label: "Distributor Application", bg: GOLD, fg: "#3b2a06" },
  product: { label: "Product Inquiry", bg: GREEN, fg: "#ffffff" },
  general: { label: "General Contact", bg: "#94a3b8", fg: "#ffffff" },
};

const TYPE_SUBJECT: Record<InquiryType, string> = {
  distributor: "New Distributor Application",
  product: "New Product Inquiry",
  general: "New General Inquiry",
};

/** Escape untrusted input before it goes anywhere near the HTML. */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalise whitespace and hard-wrap, so long messages cannot break layout. */
function formatMessage(raw: string): string {
  return escapeHtml(raw).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
}

function row(label: string, value: string | undefined | null, last = false): string {
  if (!value || !value.trim()) return "";
  return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};color:${SLATE};font-size:14px;white-space:nowrap;vertical-align:top;width:130px;font-weight:600;">${label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid ${last ? "transparent" : BORDER};color:#0f172a;font-size:14px;word-break:break-word;">${escapeHtml(value)}</td>
      </tr>`;
}

function shell(inner: string, preview: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(preview)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
${inner}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function header(badge: { label: string; bg: string; fg: string }): string {
  return `        <tr>
          <td style="background:${GREEN_DARK};padding:22px 24px;">
            <div style="font-size:19px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">${BRAND_NAME}</div>
            <div style="font-size:12px;color:#a7c9b6;margin-top:2px;">by ${SITE_NAME} &middot; Drip Irrigation Manufacturer</div>
          </td>
          <td align="right" style="background:${GREEN_DARK};padding:22px 24px;">
            <span style="display:inline-block;background:${badge.bg};color:${badge.fg};font-size:11px;font-weight:700;padding:5px 11px;border-radius:999px;letter-spacing:0.3px;white-space:nowrap;">${escapeHtml(badge.label)}</span>
          </td>
        </tr>`;
}

function footer(): string {
  return `        <tr>
          <td style="background:${BG};padding:20px 24px;border-top:1px solid ${BORDER};">
            <div style="font-size:12px;color:${SLATE};line-height:1.7;">
              <strong style="color:${GREEN_DARK};">${SITE_NAME}</strong><br />
              ${escapeHtml(CONTACT.address)}<br />
              ${escapeHtml(CONTACT.phone)} &middot; ${escapeHtml(CONTACT.email)}
            </div>
          </td>
        </tr>`;
}

/** Notification sent to the business owner for every new inquiry. */
export function inquiryNotification(d: InquiryData): { subject: string; html: string; text: string } {
  const meta = TYPE_META[d.type] ?? TYPE_META.general;
  const received = d.createdAt
    ? d.createdAt.toISOString().replace("T", " ").slice(0, 16) + " UTC"
    : "just now";

  const html = shell(
    `${header(meta)}
        <tr>
          <td style="padding:24px 24px 8px 24px;">
            <h1 style="margin:0 0 4px 0;font-size:20px;color:${GREEN_DARK};line-height:1.3;">New website inquiry</h1>
            <p style="margin:0;font-size:14px;color:${SLATE};line-height:1.6;">${escapeHtml(d.name)} submitted the form on the website. Received ${escapeHtml(received)}.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
              ${row("Name", d.name)}
              ${row("Email", d.email)}
              ${row("Phone", d.phone)}
              ${row("Company", d.company)}
              ${row("Country", d.country)}
              ${row("Product", d.productName, true)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 8px 24px;">
            <div style="font-size:12px;font-weight:700;color:${SLATE};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">Message</div>
            <div style="background:${BG};border-left:3px solid ${GREEN};border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.7;color:#0f172a;">${formatMessage(d.message)}</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 24px 28px 24px;">
            <a href="mailto:${encodeURIComponent(d.email)}?subject=${encodeURIComponent("Re: " + TYPE_SUBJECT[d.type])}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 28px;border-radius:8px;">Reply to ${escapeHtml(d.name.split(" ")[0])}</a>
            <div style="margin-top:12px;font-size:12px;color:${SLATE};">Or copy their address: ${escapeHtml(d.email)}</div>
          </td>
        </tr>
${footer()}`,
    `${TYPE_SUBJECT[d.type]} - ${d.name}`
  );

  const text = [
    `${TYPE_SUBJECT[d.type].toUpperCase()}`,
    `Received: ${received}`,
    "",
    `Name:     ${d.name}`,
    `Email:    ${d.email}`,
    `Phone:    ${d.phone || "-"}`,
    `Company:  ${d.company || "-"}`,
    `Country:  ${d.country || "-"}`,
    `Product:  ${d.productName || "-"}`,
    "",
    "MESSAGE:",
    d.message,
    "",
    "--",
    `${SITE_NAME}`,
    CONTACT.address,
    `${CONTACT.phone} | ${CONTACT.email}`,
  ].join("\n");

  return { subject: `${TYPE_SUBJECT[d.type]} - ${d.name}`, html, text };
}

/** Confirmation sent to the person who submitted the form. */
export function inquiryAutoReply(d: InquiryData): { subject: string; html: string; text: string } {
  const first = (d.name || "").trim().split(/\s+/)[0] || "there";

  const intro =
    d.type === "distributor"
      ? "Thank you for applying to distribute the Krusheebindoo range. We have received your application and our team will review your details and get back to you shortly."
      : d.type === "product"
        ? `Thank you for your interest in ${d.productName || "our products"}. We have received your inquiry and our sales team will get back to you with pricing and availability.`
        : "Thank you for getting in touch with us. We have received your message and our team will get back to you shortly.";

  const html = shell(
    `${header(TYPE_META.general)}
        <tr>
          <td style="padding:26px 24px 10px 24px;">
            <h1 style="margin:0 0 10px 0;font-size:21px;color:${GREEN_DARK};line-height:1.3;">Hello ${escapeHtml(first)},</h1>
            <p style="margin:0 0 12px 0;font-size:15px;line-height:1.75;color:#334155;">${escapeHtml(intro)}</p>
            <p style="margin:0 0 12px 0;font-size:15px;line-height:1.75;color:#334155;">Our sales team responds within <strong style="color:${GREEN_DARK};">1-2 business days</strong>. If your requirement is urgent, please call or WhatsApp us on <a href="tel:${escapeHtml(CONTACT.phone.replace(/\s/g, ""))}" style="color:${GREEN};font-weight:700;text-decoration:none;">${escapeHtml(CONTACT.phone)}</a>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 24px 24px 24px;">
            <div style="background:${BG};border:1px solid ${BORDER};border-radius:8px;padding:16px 18px;">
              <div style="font-size:12px;font-weight:700;color:${SLATE};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">What you sent us</div>
              <div style="font-size:14px;line-height:1.75;color:#0f172a;">${formatMessage(d.message)}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 26px 24px;">
            <div style="font-size:14px;color:${SLATE};line-height:1.8;">
              <strong style="color:${GREEN_DARK};">Meanwhile, why ${BRAND_NAME}?</strong><br />
              Every lateral is manufactured to IS 13488 in Class 2 UV-stabilised LDPE, and factory-fixed emitters deliver a uniform 4 LPH at the root zone - up to 60% less water than flood irrigation, with better yield from the same borewell.
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 24px 28px 24px;">
            <a href="${escapeHtml(CONTACT.website ?? "")}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 28px;border-radius:8px;">Browse our products</a>
          </td>
        </tr>
${footer()}`,
    `Thank you for contacting ${SITE_NAME}`
  );

  const text = [
    `Hello ${first},`,
    "",
    intro,
    "",
    `Our sales team responds within 1-2 business days. If your requirement is`,
    `urgent, call or WhatsApp us on ${CONTACT.phone}.`,
    "",
    "WHAT YOU SENT US:",
    d.message,
    "",
    `Meanwhile, why ${BRAND_NAME}?`,
    "Every lateral is manufactured to IS 13488 in Class 2 UV-stabilised LDPE,",
    "and factory-fixed emitters deliver a uniform 4 LPH at the root zone -",
    "up to 60% less water than flood irrigation.",
    "",
    "--",
    `${SITE_NAME}`,
    CONTACT.address,
    `${CONTACT.phone} | ${CONTACT.email}`,
  ].join("\n");

  return { subject: `Thank you for contacting ${SITE_NAME}`, html, text };
}