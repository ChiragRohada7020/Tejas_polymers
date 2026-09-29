import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { sendPhotoToTelegram } from "@/lib/telegram";

/**
 * Server-side upload guard.
 *
 * The browser resizes photos before upload (see lib/image-compress.ts),
 * because a Vercel serverless function rejects request bodies over
 * 4.5 MB. This limit is only a backstop for requests that reach the
 * server unresized - it is deliberately above the platform cap so we
 * are not the component rejecting a file Vercel would allow.
 */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);
const WEBP_RIFF = Buffer.from("RIFF");
const WEBP_WEBP = Buffer.from("WEBP");

function matchesMagic(buffer: Buffer, mime: string): boolean {
  if (mime === "image/png") return buffer.subarray(0, 8).equals(PNG_SIG);
  if (mime === "image/jpeg") return buffer.subarray(0, 3).equals(JPEG_SIG);
  if (mime === "image/webp") {
    return buffer.subarray(0, 4).equals(WEBP_RIFF) && buffer.subarray(8, 12).equals(WEBP_WEBP);
  }
  return false;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach an image file." }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only PNG, JPEG or WebP images are allowed." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error:
          "That image is too large to upload as-is. The browser normally resizes it automatically — if you are seeing this, try a different image.",
      },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesMagic(bytes, file.type)) {
    return NextResponse.json({ error: "File contents do not match its image type." }, { status: 400 });
  }

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const filename = `site-${stamp}-${rand}.${ext}`;

  // 1) Preferred: store the photo in Telegram and serve it from there.
  const caption = typeof form.get("caption") === "string" ? String(form.get("caption")) : "";
  const sent = await sendPhotoToTelegram(bytes, filename, caption || undefined);
  if (sent) {
    return NextResponse.json({ ok: true, url: sent.url, storage: "telegram" });
  }

  // 2) Fallback: local disk save. On serverless hosts (Vercel, Netlify) the
  //    filesystem is read-only, so this throws — return a clear error instead
  //    of failing the whole request.
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ ok: true, url: `/uploads/${filename}`, storage: "local" });
  } catch (err) {
    console.error("Local upload fallback failed:", err);
    return NextResponse.json(
      {
        error:
          "Could not store the image. The Telegram bot is not reachable and this host has no writable disk — check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.",
      },
      { status: 500 }
    );
  }
}
