import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { SiteContent } from "@/lib/models/SiteContent";
import {
  CONTENT_DEF_MAP,
  invalidateSiteContentCache,
  sanitizeImagePath,
  sanitizeLink,
  sanitizeRich,
  sanitizeText,
} from "@/lib/site-content";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const docs = await SiteContent.find().select("key value locale updatedAt").lean();
  return NextResponse.json({ items: docs });
}

/**
 * Reads the locale off a request payload, falling back to English.
 *
 * The fallback matters: rows written before bilingual editing have no locale
 * and hold English copy, so an old or malformed payload must keep writing to
 * the English bucket rather than silently overwriting Marathi.
 */
function resolvePayloadLocale(raw: unknown): "mr" | "en" {
  return raw === "mr" || raw === "en" ? raw : "en";
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
    return NextResponse.json({ error: "Provide 1–200 content items." }, { status: 400 });
  }

  const locale = resolvePayloadLocale((body as { locale?: unknown }).locale);

  await connectDB();
  let saved = 0;

  for (const item of items) {
    const key = typeof (item as { key?: unknown }).key === "string" ? (item as { key: string }).key : "";
    const def = CONTENT_DEF_MAP[key];
    if (!def) continue;
    const raw = (item as { value?: unknown }).value;

    let value: string | null;
    if (def.kind === "text") value = sanitizeText(raw, def.maxLength);
    else if (def.kind === "rich") value = sanitizeRich(raw, def.maxLength);
    else if (def.kind === "link") value = sanitizeLink(raw, def.maxLength);
    else value = sanitizeImagePath(raw) ?? "";

    if (value === null) continue;
    // The filter must include locale, otherwise the upsert matches the other
    // language's row and overwrites the wrong translation.
    await SiteContent.updateOne(
      { key, locale },
      { $set: { value, kind: def.kind, locale } },
      { upsert: true }
    );
    saved += 1;
  }

  // Rendered pages read content from a short-lived cache. Drop it on
  // save so the admin sees their own edit immediately rather than
  // waiting out the TTL.
  invalidateSiteContentCache();

  return NextResponse.json({ ok: true, saved, locale });
}
