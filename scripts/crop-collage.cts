import { writeFile } from "fs/promises";
import sharp from "sharp";

/**
 * Cuts one product out of the owner's collage photographs.
 *
 * The three reference photos are group shots of the Krusheebindoo range.
 * They are good for a catalogue page but useless as individual product
 * cards, so each product is lifted into its own file here.
 *
 * Everything is extracted by hand-coordinate region, turned into a real
 * alpha cut-out, and composited onto the same mint gradient the vector
 * illustrations already use, at a uniform 4:3 that exactly matches
 * ProductCard's aspect-[4/3] + object-cover so nothing gets cropped.
 *
 * Two products need different treatment. In the WhatsApp shot the
 * take-off valve and the lateral cock are propped in front of the black
 * drip coil, so the coil sits directly behind them and no threshold can
 * separate the two. Both are photographed against a clean backdrop in
 * 3.jpeg instead, which is also why that file is the only one that needs
 * a looser white threshold - its background is pale blue, not white.
 *
 * Run with:  npx tsx scripts/crop-collage.cts [slug ...]
 *            (no arguments = crop everything)
 */

const SOURCE =
  "C:/Users/chira/Downloads/WhatsApp Image 2026-09-30 at 11.06.03 AM.jpeg";
const SOURCE_ALT = "C:/Users/chira/Downloads/3.jpeg";

type Crop = {
  slug: string;
  note: string;
  region: { left: number; top: number; width: number; height: number };
  /** Defaults to the white-backdrop WhatsApp shot. */
  source?: string;
  /** Alpha cut-out thresholds; background min-channel at/above floor is transparent. */
  floor?: number;
  ceil?: number;
  /**
   * Set instead of floor/ceil to flood-fill the backdrop outward from the
   * crop border. Needed where the backdrop is a gradient rather than one
   * flat colour, because no single brightness threshold can clear it.
   */
  flood?: number;
};

const CROPS: Crop[] = [
  {
    slug: "inline-screen-filter",
    note: "blue T-handle screen filter, front-most item",
    region: { left: 302, top: 90, width: 278, height: 925 },
  },
  {
    slug: "plain-lateral-16mm",
    note: "black coil + green branded tape, left edge (right side tucks behind the filter)",
    region: { left: 10, top: 220, width: 246, height: 690 },
  },
  {
    slug: "flat-inline-drip-12-4-40",
    note: "upper coil, red 12-4-40 label; top clears the round Tejas Polymers disc, right stops before the disc filter",
    region: { left: 574, top: 500, width: 606, height: 235 },
  },
  {
    slug: "flat-inline-drip-16-4-30",
    note: "lower coil, green 16-4-30 label; top clears the 12-4-40 label, sides clear the take-off valve and lateral cock",
    region: { left: 700, top: 722, width: 340, height: 253 },
  },
  {
    slug: "take-off-connector",
    note: "blue lever take-off valve, shot against a clean backdrop in 3.jpeg",
    region: { left: 124, top: 786, width: 104, height: 148 },
    source: SOURCE_ALT,
    flood: 26,
  },
  {
    slug: "lateral-cock",
    note: "grey body + green lever lateral cock, shot against a clean backdrop in 3.jpeg",
    region: { left: 666, top: 1170, width: 118, height: 170 },
    source: SOURCE_ALT,
    flood: 26,
  },
  {
    slug: "disc-filter",
    note: "black 2 inch disc filter, right edge of the frame; left clears the lateral cock",
    region: { left: 1196, top: 445, width: 320, height: 570 },
  },
];

/**
 * The smallest part in the set is the take-off connector at ~104px wide.
 * 2.5x is the point where lanczos3 still looks acceptable at card size;
 * going higher only smears the pixels.
 */
const MAX_UPSCALE = 2.5;

/**
 * The remaining catalogue entries are flat vector illustrations drawn on a
 * mint gradient (#f0f9f4 at the top fading to #dcf0e4 at the bottom).
 * Compositing the cut-outs onto the same gradient keeps the product grid
 * visually consistent instead of alternating photos on white next to
 * illustrations on mint.
 */
const GRADIENT_TOP: [number, number, number] = [240, 249, 244];
const GRADIENT_BOTTOM: [number, number, number] = [220, 240, 228];

/** Uniform 4:3 canvas, matching ProductCard's aspect-[4/3] + object-cover. */
const CANVAS_W = 1000;
const CANVAS_H = 750;

/**
 * The reference photo is shot on a plain white sweep, so the white
 * backdrop can be turned into real transparency and the product laid
 * straight onto the brand gradient. A hard white->transparent switch
 * would leave jaggies on the edge, so the ramp between these two
 * thresholds gives the outline a few steps of anti-aliasing.
 */
const WHITE_FLOOR = 248; // at or above this, fully transparent
const WHITE_CEIL = 232; // at or below this, fully opaque

/**
 * Marks every pixel reachable from the crop border without crossing a
 * colour jump bigger than `tol`. Because it walks the backdrop rather
 * than testing brightness, it follows a gradient cleanly and stops dead
 * at the product, which a single threshold cannot do.
 */
function floodBackground(rgba: Buffer, w: number, h: number, tol: number) {
  const isBg = new Uint8Array(w * h);
  const stack: number[] = [];

  const seed = (x: number, y: number) => {
    const i = y * w + x;
    if (!isBg[i]) {
      isBg[i] = 1;
      stack.push(i);
    }
  };

  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }

  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i / w) | 0;

    for (let n = 0; n < 4; n++) {
      const nx = n === 0 ? x + 1 : n === 1 ? x - 1 : x;
      const ny = n === 2 ? y + 1 : n === 3 ? y - 1 : y;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

      const ni = ny * w + nx;
      if (isBg[ni]) continue;

      const a = i * 4;
      const b = ni * 4;
      const delta =
        Math.abs(rgba[a] - rgba[b]) +
        Math.abs(rgba[a + 1] - rgba[b + 1]) +
        Math.abs(rgba[a + 2] - rgba[b + 2]);

      if (delta <= tol) {
        isBg[ni] = 1;
        stack.push(ni);
      }
    }
  }

  return isBg;
}

async function cutOut(
  input: Buffer,
  opts: { floor?: number; ceil?: number; flood?: number }
) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const alpha = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const s = i * channels;
    const d = i * 4;

    out[d] = data[s];
    out[d + 1] = data[s + 1];
    out[d + 2] = data[s + 2];

    // Brighter than the floor means backdrop, so it has to fade towards
    // zero alpha. Note the inversion: high min => transparent.
    const min = Math.min(data[s], data[s + 1], data[s + 2]);
    const floor = opts.floor ?? WHITE_FLOOR;
    const ceil = opts.ceil ?? WHITE_CEIL;
    const t = (floor - min) / (floor - ceil);
    alpha[i] = Math.round(Math.max(0, Math.min(1, t)) * 255);
  }

  if (opts.flood) {
    const isBg = floodBackground(out, width, height, opts.flood);
    for (let i = 0; i < alpha.length; i++) alpha[i] = isBg[i] ? 0 : 255;
  }

  // Re-crop to the real extent of the product; a soft alpha ramp or a
  // flood fill can both leave a band of near-empty border.
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      out[i * 4 + 3] = alpha[i];
      if (alpha[i] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return null;

  return sharp(out, { raw: { width, height, channels: 4 } })
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })
    .png()
    .toBuffer();
}

async function cropOne({ slug, note, region, source, floor, ceil, flood }: Crop) {
  // Extract first, cut out second. Reading raw pixels has to happen on
  // its own pipeline: chaining .extract() into .raw() makes libvips
  // apply the extract against the full frame, which fails with
  // "extract_area: bad extract area" once the frame runs out.
  const cropped = await sharp(source ?? SOURCE).extract(region).toBuffer();

  const cut = await cutOut(cropped, { floor, ceil, flood });
  if (!cut) {
    console.log(`${slug.padEnd(28)} (no product found in region - skipped)`);
    return;
  }

  const meta = await sharp(cut).metadata();
  const w = meta.width!;
  const h = meta.height!;

  const fit = Math.min(CANVAS_W / w, CANVAS_H / h);
  const scale = Math.min(fit, MAX_UPSCALE);
  const dw = Math.max(1, Math.round(w * scale));
  const dh = Math.max(1, Math.round(h * scale));

  // A flood-filled mask has a hard 0/255 edge, and lanczos3 rings visibly
  // on a hard alpha boundary, so soften it slightly after upscaling.
  const pipeline = sharp(cut).resize(dw, dh, {
    fit: "fill",
    kernel: "lanczos3",
  });
  if (flood) pipeline.blur(0.4);
  const body = await pipeline.toBuffer();

  // Vertical mint gradient, written straight into a raw buffer.
  const canvas = Buffer.alloc(CANVAS_W * CANVAS_H * 3);
  for (let y = 0; y < CANVAS_H; y++) {
    const t = y / (CANVAS_H - 1);
    const r = Math.round(GRADIENT_TOP[0] + (GRADIENT_BOTTOM[0] - GRADIENT_TOP[0]) * t);
    const g = Math.round(GRADIENT_TOP[1] + (GRADIENT_BOTTOM[1] - GRADIENT_TOP[1]) * t);
    const b = Math.round(GRADIENT_TOP[2] + (GRADIENT_BOTTOM[2] - GRADIENT_TOP[2]) * t);
    for (let x = 0; x < CANVAS_W; x++) {
      const o = (y * CANVAS_W + x) * 3;
      canvas[o] = r;
      canvas[o + 1] = g;
      canvas[o + 2] = b;
    }
  }

  const encoded = await sharp(canvas, {
    raw: { width: CANVAS_W, height: CANVAS_H, channels: 3 },
  })
    .composite([
      {
        input: body,
        left: Math.max(0, Math.round((CANVAS_W - dw) / 2)),
        top: Math.max(0, Math.round((CANVAS_H - dh) / 2)),
      },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  // Encoded first, written second. sharp's toFile() opens the target
  // path itself, and this repo lives inside OneDrive, whose sync filter
  // intermittently returns ERROR_INVALID_ARGUMENT on those handles
  // ("unable to open for write"). Encoding into memory and handing the
  // bytes to fs avoids that path, and the retry covers the remaining
  // window where OneDrive still holds the file after replacing it.
  const out = `public/images/products/${slug}.jpg`;
  for (let attempt = 1; ; attempt++) {
    try {
      await writeFile(out, encoded);
      break;
    } catch (err) {
      if (attempt >= 5) throw err;
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }

  console.log(
    `${slug.padEnd(28)} ${String(region.width).padStart(4)}x${String(
      region.height
    ).padEnd(5)} -> ${w}x${h} cut-out @${scale.toFixed(2)}x  (${note})`
  );
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length
    ? CROPS.filter((c) => only.includes(c.slug))
    : CROPS;

  if (!list.length) {
    console.error("no crop matches:", only.join(", "));
    process.exit(1);
  }

  for (const c of list) await cropOne(c);
  console.log(`\nwrote ${list.length} product image(s)`);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.stack : e);
  process.exit(1);
});
