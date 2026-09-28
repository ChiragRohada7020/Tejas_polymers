/**
 * Telegram Bot API helper — pushes uploaded images to the admin's Telegram
 * bot so they are hosted by Telegram, and returns a direct link.
 *
 * Required env (server-side only, never exposed to the browser):
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — chat that receives the photos
 */

const API = "https://api.telegram.org";

function botToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function chatId(): string {
  return process.env.TELEGRAM_CHAT_ID || "";
}

export function isTelegramConfigured(): boolean {
  return Boolean(botToken() && chatId());
}

type SentPhoto = {
  /**
   * Site-local URL to store as imageUrl (e.g. `/api/media/BAAC...`).
   * The Telegram token never appears in page HTML — the media route
   * streams the bytes server-side.
   */
  url: string;
  /** Telegram's stable file_id (used by the media route to fetch bytes). */
  fileId: string;
};

/**
 * Uploads image bytes to the configured Telegram chat via `sendPhoto`.
 * Returns the media URL, or null when Telegram is unavailable /
 * unconfigured or the call fails (caller should fall back to local save).
 */
export async function sendPhotoToTelegram(
  bytes: Buffer,
  filename: string,
  caption?: string
): Promise<SentPhoto | null> {
  if (!isTelegramConfigured()) return null;

  const form = new FormData();
  form.append("chat_id", chatId());
  if (caption) form.append("caption", caption.slice(0, 1024));
  form.append("photo", new Blob([new Uint8Array(bytes)]), filename);

  try {
    const res = await fetch(`${API}/bot${botToken()}/sendPhoto`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok: boolean;
      result?: { photo?: { file_id?: string; file_unique_id?: string }[] };
    };
    const photo = data?.result?.photo?.at(-1); // largest size
    const fileId = photo?.file_id;
    if (!data.ok || !fileId) return null;

    return { url: `/api/media/${fileId}`, fileId };
  } catch (err) {
    console.error("sendPhotoToTelegram failed:", err);
    return null;
  }
}

/** Resolves a Telegram file_id into a direct (token-bearing) download URL. */
export async function resolveTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!botToken()) return null;
  try {
    const res = await fetch(
      `${API}/bot${botToken()}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    const filePath = data?.result?.file_path;
    if (!data.ok || !filePath) return null;
    return `${API}/file/bot${botToken()}/${filePath}`;
  } catch (err) {
    console.error("resolveTelegramFileUrl failed:", err);
    return null;
  }
}
