/**
 * Builds the favicon / app-icon set from the supplied logo artwork.
 *
 * WHY THIS EXISTS
 *
 * Google Search shows one favicon per hostname next to the site name, and it
 * is strict about how it is served:
 *
 *   - the URL must be STABLE ("don't change the URL frequently"). Next.js's
 *     `app/icon.png` convention emits `/icon.png?<build-hash>`, which changes
 *     on every deploy - exactly what Google warns against.
 *   - the file must be a square of at least 8x8px, "preferably larger than
 *     48x48px". The shipped `icon.png` was a squashed 96x96 crop of the
 *     240x120 wordmark lockup, so at the 16-32px Google renders it was an
 *     unreadable smear of half a droplet and the letters "krushe".
 *   - Googlebot-Image must be able to fetch it.
 *
 * So this script cuts the DROPLET MARK out of the original artwork and writes
 * a stable, unhashed icon set:
 *
 *   public/favicon.ico              multi-size 16/32/48
 *   public/icons/icon-48.png        48x48   (the multiple-of-48 Google asks for)
 *   public/icons/icon-96.png        96x96
 *   public/icons/icon-192.png       192x192
 *   public/apple-touch-icon.png     180x180
 *   public/images/brand/krusheebindoo-mark.png  192x192, also used as the
 *                                   Organization logo in JSON-LD
 *
 * The droplet is found as the largest connected ink component of the source
 * rather than by hard-coded coordinates, so re-running against a redrawn
 * logo still works. Its background is removed by flood-filling inward from
 * the border, NOT by a global colour key: the droplet contains white artwork
 * of its own (the plant), and a naive "white -> transparent" pass would punch
 * holes straight through it.
 *
 * Usage: npm run brand:favicons
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "images", "logo1.jpeg");

/** Square side drawn around the droplet, as a multiple of its own size. */
const MARGIN = 1.12;

function findDroplet(data, width, height, channels) {
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) ink[y * width + x] = 1;
    }
  }

  const seen = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let best = null;

  for (let start = 0; start < ink.length; start++) {
    if (!ink[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    let n = 0;
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;

    while (sp > 0) {
      const p = stack[--sp];
      const x = p % width;
      const y = (p - x) / width;
      n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ];
      for (const q of neighbours) {
        if (q >= 0 && ink[q] && !seen[q]) {
          seen[q] = 1;
          stack[sp++] = q;
        }
      }
    }
    // The droplet is the biggest blob on the canvas.
    if (!best || n > best.n) best = { n, minX, maxX, minY, maxY };
  }
  return best;
}

/**
 * Builds the alpha channel: 0 outside the mark, 255 on it.
 *
 * Three things have to be true at once, and they pull in different
 * directions:
 *
 *   1. The white plant inside the droplet must stay OPAQUE. A global
 *      "white -> transparent" key would punch straight through it, so the
 *      background has to be found by flood-filling inward from the border
 *      instead. Anything the fill cannot reach is enclosed by the mark and
 *      therefore part of it.
 *
 *   2. JPEG ringing around the mark must be TRANSPARENT. Ringing produces
 *      both lighter and darker pixels; the darker ones are indistinguishable
 *      from artwork by colour alone and would survive as a dirty dotted
 *      fringe once the icon is scaled down to 16-48px.
 *
 *   3. The mark itself must stay opaque, including its anti-aliased edge.
 *
 * (2) is solved by size rather than colour: the mark is one large connected
 * blob, while ringing is a scatter of specks a few pixels across. So the
 * fill is allowed to travel through everything EXCEPT the large components,
 * which both removes the specks and leaves the enclosed plant opaque, since
 * reaching it would mean crossing the mark itself.
 */
function buildAlpha(data, width, height, channels, minComponent) {
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) ink[y * width + x] = 1;
    }
  }

  // Keep only the components big enough to be artwork.
  const keep = new Uint8Array(width * height);
  const seen = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  const blob = [];

  for (let start = 0; start < ink.length; start++) {
    if (!ink[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    blob.length = 0;
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % width;
      const y = (p - x) / width;
      blob.push(p);
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ];
      for (const q of neighbours) {
        if (q >= 0 && ink[q] && !seen[q]) {
          seen[q] = 1;
          stack[sp++] = q;
        }
      }
    }
    if (blob.length >= minComponent) for (const p of blob) keep[p] = 1;
  }

  // Flood the border through everything that is not artwork.
  const outside = new Uint8Array(width * height);
  let sp = 0;
  const push = (p) => {
    if (!outside[p] && !keep[p]) {
      outside[p] = 1;
      stack[sp++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (sp > 0) {
    const p = stack[--sp];
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (y > 0) push(p - width);
    if (y < height - 1) push(p + width);
  }

  const alpha = new Uint8Array(width * height);
  for (let p = 0; p < alpha.length; p++) alpha[p] = outside[p] ? 0 : 255;
  return alpha;
}

/** Wraps PNG buffers in a Vista-style .ico container. */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;
  images.forEach((img, i) => {
    const at = i * 16;
    directory.writeUInt8(img.size >= 256 ? 0 : img.size, at); // width
    directory.writeUInt8(img.size >= 256 ? 0 : img.size, at + 1); // height
    directory.writeUInt8(0, at + 2); // palette size
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(img.buffer.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += img.buffer.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.buffer)]);
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`source artwork not found: ${SRC}`);

  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const droplet = findDroplet(data, width, height, channels);
  if (!droplet) throw new Error("could not find the droplet in the source artwork");

  const dropW = droplet.maxX - droplet.minX + 1;
  const dropH = droplet.maxY - droplet.minY + 1;
  const side = Math.round(Math.max(dropW, dropH) * MARGIN);
  const centreX = (droplet.minX + droplet.maxX) / 2;
  const centreY = (droplet.minY + droplet.maxY) / 2;

  // Keep the square inside the canvas.
  let left = Math.round(centreX - side / 2);
  let top = Math.round(centreY - side / 2);
  left = Math.max(0, Math.min(left, width - side));
  top = Math.max(0, Math.min(top, height - side));

  console.log(`droplet: ${dropW}x${dropH} at (${droplet.minX},${droplet.minY})`);
  console.log(`square : ${side}x${side} at (${left},${top})`);

  // The source is a JPEG, so its edges ring: a 3x3 median clears the ringing
  // that would otherwise survive as a dirty halo around the droplet once it
  // is downscaled to 16-48px, and does not move the hard colour boundaries.
  const crop = await sharp(SRC)
    .extract({ left, top, width: side, height: side })
    .median(3)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = buildAlpha(
    crop.data,
    side,
    side,
    crop.info.channels,
    Math.max(64, Math.round(side * side * 0.002))
  );
  const rgba = Buffer.alloc(side * side * 4);
  for (let p = 0; p < side * side; p++) {
    const i = p * crop.info.channels;
    rgba[p * 4] = crop.data[i];
    rgba[p * 4 + 1] = crop.data[i + 1];
    rgba[p * 4 + 2] = crop.data[i + 2];
    rgba[p * 4 + 3] = alpha[p];
  }

  const master = sharp(rgba, { raw: { width: side, height: side, channels: 4 } });

  const write = async (out, size) => {
    const file = path.join(ROOT, out);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await master
      .clone()
      .resize(size, size, { kernel: "lanczos3" })
      .png({ compressionLevel: 9 })
      .toFile(file);
    console.log(`  ${out}  ${size}x${size}  ${(fs.statSync(file).size / 1024).toFixed(1)} kB`);
  };

  await write("public/icons/icon-48.png", 48);
  await write("public/icons/icon-96.png", 96);
  await write("public/icons/icon-192.png", 192);
  await write("public/apple-touch-icon.png", 180);
  await write("public/images/brand/krusheebindoo-mark.png", 192);

  const ico = [];
  for (const size of [16, 32, 48]) {
    ico.push({
      size,
      buffer: await master
        .clone()
        .resize(size, size, { kernel: "lanczos3" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    });
  }
  const icoPath = path.join(ROOT, "public", "favicon.ico");
  fs.writeFileSync(icoPath, buildIco(ico));
  console.log(`  public/favicon.ico  16/32/48  ${(fs.statSync(icoPath).size / 1024).toFixed(1)} kB`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
