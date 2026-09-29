import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

/**
 * Repairs image paths left behind by the SVG -> JPEG conversion.
 *
 * The vector artwork was replaced with real .jpg files, but the
 * database still pointed at the old .svg paths, so every image 404'd.
 * Re-seeding would fix it but would also destroy the product photos the
 * owner has already uploaded through the admin panel, so this does a
 * targeted rewrite instead:
 *
 *   1. .svg paths become their .jpg equivalents (both exist on disk)
 *   2. the four seeded products that are missing entirely are inserted
 *   3. uploaded photos (and any admin-entered text) are left untouched
 */
async function main() {
  const { connectDB } = await import("../src/lib/db");
  await connectDB();
  const { Product } = await import("../src/lib/models/Product");
  const { Category } = await import("../src/lib/models/Category");
  const { products1 } = await import("../src/lib/seed-products-a");
  const { products2 } = await import("../src/lib/seed-products-b");
  const { categories } = await import("../src/lib/seed-data");
  const { invalidateCatalogCache } = await import("../src/lib/catalog");

  const seedProducts = [...products1, ...products2];

  // 1) Categories: .svg -> .jpg
  let catFixed = 0;
  for (const c of categories) {
    const next = c.imageUrl.replace(/\.svg$/, ".jpg");
    const res = await Category.updateOne(
      { slug: c.slug },
      { $set: { imageUrl: next } }
    );
    if (res.modifiedCount) catFixed++;
  }
  console.log(`categories updated: ${catFixed}/${categories.length}`);

  // 2) Products that still point at a deleted .svg
  const stale = await Product.find({ imageUrl: /\.svg$/ }).select("slug imageUrl").lean();
  for (const p of stale) {
    const next = p.imageUrl.replace(/\.svg$/, ".jpg");
    await Product.updateOne({ slug: p.slug }, { $set: { imageUrl: next } });
  }
  console.log(`products repointed from .svg: ${stale.length}`);

  // 3) Seeded products missing from the database entirely
  let inserted = 0;
  for (const seed of seedProducts) {
    const existing = await Product.findOne({ slug: seed.slug }).lean();
    if (existing) continue;
    await Product.create(seed);
    inserted++;
    console.log(`  + inserted missing product: ${seed.name}`);
  }
  console.log(`products inserted: ${inserted}`);

  // Report anything still broken.
  const stillBad = await Product.find({ imageUrl: /\.svg$/ }).select("name").lean();
  console.log(`\nproducts still on .svg: ${stillBad.length}`);

  const total = await Product.countDocuments();
  const uploaded = await Product.countDocuments({ imageUrl: /^\/api\/media\// });
  const local = await Product.countDocuments({ imageUrl: /^\/images\/products\/.*\.jpg$/ });
  console.log(`total products: ${total}  (uploaded photos: ${uploaded}, local .jpg: ${local})`);

  invalidateCatalogCache();
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});