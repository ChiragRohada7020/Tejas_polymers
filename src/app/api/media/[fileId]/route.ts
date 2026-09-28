import { NextResponse } from "next/server";
import { isTelegramConfigured, resolveTelegramFileUrl } from "@/lib/telegram";

/**
 * Streams a Telegram-hosted image by file_id so the bot token never
 * appears in page HTML. Cacheable for a year (Telegram file URLs are
 * stable for a given file_id).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  if (!isTelegramConfigured()) {
    return new NextResponse("Not configured", { status: 404 });
  }

  const { fileId } = await params;
  if (!/^[\w-]{1,128}$/.test(fileId)) {
    return new NextResponse("Bad file id", { status: 400 });
  }

  const directUrl = await resolveTelegramFileUrl(fileId);
  if (!directUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const res = await fetch(directUrl, { cache: "force-cache" });
    if (!res.ok || !res.body) {
      return new NextResponse("Upstream error", { status: 502 });
    }

    const ext = (directUrl.split(".").pop() || "").toLowerCase();
    const mimeByExt: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType =
      mimeByExt[ext] || res.headers.get("Content-Type") || "image/jpeg";

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return new NextResponse("Upstream error", { status: 502 });
  }
}
