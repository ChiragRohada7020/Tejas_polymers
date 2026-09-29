/**
 * Client-side image downscaling for admin uploads.
 *
 * Why this exists: a Vercel serverless function rejects request bodies
 * larger than 4.5 MB, so a 20 MB phone photo can never reach the
 * server at all. The only place big files can be reduced is in the
 * browser, so we resize there and upload the result.
 *
 * Uses createImageBitmap + canvas, which is available in every browser
 * we target and avoids pulling an image library into the bundle.
 */

/** Longest edge, in pixels. Products are shown at most ~800px wide. */
const MAX_EDGE = 1600;

/** Target bytes for the re-encoded image. */
const TARGET_BYTES = 1.2 * 1024 * 1024;

/** Quality ladder, walked down until the file fits. */
const QUALITY_STEPS = [0.86, 0.8, 0.72, 0.64, 0.55, 0.45];

export type CompressResult = {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  originalBytes: number;
  compressedBytes: number;
};

function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img as unknown as ImageBitmap);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image."))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Resize and re-encode an image for upload.
 *
 * Always outputs JPEG, which is what the catalogue uses everywhere and
 * what Telegram's sendPhoto handles most predictably. Returns the
 * original file untouched if it already fits and is small enough, so we
 * never inflate an image that did not need it.
 */
export async function compressImageForUpload(
  file: File,
  maxEdge = MAX_EDGE,
  targetBytes = TARGET_BYTES
): Promise<CompressResult> {
  const bitmap = await loadBitmap(file);
  const sw = "width" in bitmap ? bitmap.width : 0;
  const sh = "height" in bitmap ? bitmap.height : 0;

  if (!sw || !sh) throw new Error("Could not read that image.");

  // No resizing needed and already small: ship it as-is.
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const needsResize = scale < 1;
  if (!needsResize && file.size <= targetBytes) {
    return {
      blob: file,
      filename: file.name,
      width: sw,
      height: sh,
      originalBytes: file.size,
      compressedBytes: file.size,
    };
  }

  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the image.");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  let blob = await canvasToBlob(canvas, QUALITY_STEPS[0]);
  for (const q of QUALITY_STEPS.slice(1)) {
    if (blob.size <= targetBytes) break;
    blob = await canvasToBlob(canvas, q);
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return {
    blob,
    filename: `${base}.jpg`,
    width,
    height,
    originalBytes: file.size,
    compressedBytes: blob.size,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}