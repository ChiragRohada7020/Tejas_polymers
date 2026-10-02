import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

/**
 * Repoints the four products that still served a Telegram marketing
 * banner at the individual photos cut out of the owner's collage shots
 * by scripts/crop-collage.cts.
 *
 * Only these four move. The PC Online Emitter 8 LPH also has a Telegram
 * photo, but it appears in none of the three collage images, so its
 * existing photo is better than anything that could be manufactured.
 *
 * The previous imageUrl for every touched row is written to
 * scripts/product-image-rollback.json first, so the change can be undone
 * without needing a database backup.
 */

type Repoint = { slug: string; imageUrl: string; why: string };

const REPOINTS: Repoint[] = [
  {
    slug: "krusheebindoo-inline-screen-filter-2-inch",
    imageUrl: "/images/products/inline-screen-filter.jpg",
    why: "blue T-handle screen filter, cropped from the WhatsApp shot",
  },
  {
    slug: "krusheebindoo-flat-inline-drip-12mm-4lph-40cm",
    imageUrl: "/images/products/flat-inline-drip-12-4-40.jpg",
    why: "12-4-40 coil with its red spec label readable",
  },
  {
    slug: "krusheebindoo-flat-inline-drip-16mm-4lph-30cm",
    imageUrl: "/images/products/flat-inline-drip-16-4-30.jpg",
    why: "16-4-30 coil with its green spec label readable",
  },
  {
    slug: "krusheebindoo-plain-drip-lateral-16mm",
    imageUrl: "/images/products/plain-lateral-16mm.jpg",
    why: "16 mm plain lateral coil with the branded green tape",
  },
];

const ROLLBACK_FILE = "scripts/product-image-rollback.json";

async function main() {
  const { existsSync } = await import("fs");
  const { writeFile } = await import("fs/promises");
  const { connectDB } = await import("../src/lib/db");
  await connectDB();
  const { Product } = await import("../src/lib/models/Product");
  const { invalidateCatalogCache } = await import("../src/lib/catalog");

  const previous: Record<string, string> = {};
  let changed = 0;

  for (const r of REPOINTS) {
    const existing = await Product.findOne({ slug: r.slug })
      .select("name imageUrl")
      .lean();

    if (!existing) {
      console.error(`  ! no product with slug "${r.slug}" - skipped`);
      continue;
    }

    if (existing.imageUrl === r.imageUrl) {
      console.log(`  = ${r.slug} already points at the new photo`);
      continue;
    }

    previous[r.slug] = existing.imageUrl;

    await Product.updateOne(
      { slug: r.slug },
      { $set: { imageUrl: r.imageUrl } }
    );

    changed++;
    console.log(`  + ${r.slug}`);
    console.log(`      ${existing.imageUrl}`);
    console.log(`   -> ${r.imageUrl}   (${r.why})`);
  }

  if (changed && !existsSync(ROLLBACK_FILE)) {
    await writeFile(ROLLBACK_FILE, JSON.stringify(previous, null, 2));
    console.log(`\nrollback written to ${ROLLBACK_FILE}`);
  }

  const total = await Product.countDocuments();
  const telegram = await Product.countDocuments({ imageUrl: /^\/api\/media\// });
  const local = await Product.countDocuments({
    imageUrl: /^\/images\/products\/.*\.jpg$/,
  });

  console.log(`\nchanged: ${changed}`);
  console.log(`total products: ${total}  (telegram photos: ${telegram}, local: ${local})`);

  invalidateCatalogCache();
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.stack : e);
  process.exit(1);
});