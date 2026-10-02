import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * Dumps catalogue slugs/names and category slugs/names.
 *
 * Read-only. Used to author scripts/seed-i18n-content.ts against the real
 * slugs rather than guessing them from image filenames, which do not match.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20_000 });
  const db = mongoose.connection.db!;

  const categories = await db
    .collection("categories")
    .find({}, { projection: { slug: 1, name: 1, nameMr: 1 } })
    .toArray();
  console.log(`\n=== CATEGORIES (${categories.length}) ===`);
  for (const c of categories) {
    console.log(`${c.slug}\t| ${c.name}\t| nameMr=${c.nameMr || "(empty)"}`);
  }

  const products = await db
    .collection("products")
    .find({}, { projection: { slug: 1, name: 1, shortDescription: 1, "mr.name": 1 } })
    .sort({ slug: 1 })
    .toArray();
  console.log(`\n=== PRODUCTS (${products.length}) ===`);
  for (const p of products) {
    console.log(`${p.slug}\n    name: ${p.name}\n    short: ${p.shortDescription}\n    mr.name: ${p.mr?.name || "(empty)"}`);
  }

  const content = await db
    .collection("sitecontents")
    .find({}, { projection: { key: 1, locale: 1 } })
    .toArray();
  const byLocale: Record<string, number> = {};
  for (const c of content) {
    const l = c.locale || "(none)";
    byLocale[l] = (byLocale[l] ?? 0) + 1;
  }
  console.log(`\n=== SITE CONTENT (${content.length}) ===`);
  console.log(byLocale);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});