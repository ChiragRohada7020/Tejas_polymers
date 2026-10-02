import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * One-time migration for bilingual site content.
 *
 * Two things have to happen before the admin editor can save anything:
 *
 *  1. DROP the old unique index on `key`.
 *     SiteContent used to guarantee one row per key. Bilingual content needs
 *     one row per (key, locale), and while that single-column unique index
 *     still exists every upsert matching { key, locale: "en" } would collide
 *     with the "mr" row and throw E11000. The index has to go before the
 *     compound one is created, otherwise the existing rows are already
 *     "duplicated" from the old index's point of view.
 *
 *  2. BACKFILL locale: "en" on existing rows.
 *     Everything already in the database is English copy that the owner or a
 *     previous admin wrote. The schema default is Marathi, so without this
 *     step the loader would file that English text into the Marathi bucket
 *     and the Marathi site would serve English while looking "translated".
 *
 * Safe to re-run: both steps are idempotent.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15_000 });

  const db = mongoose.connection.db;
  if (!db) throw new Error("no database handle");

  const col = db.collection("sitecontents");
  const existing = await col.indexes();
  const names = existing.map((i) => i.name);

  console.log(`sitecontents indexes before: ${names.join(", ") || "(none)"}`);

  // 1. Drop the legacy single-column unique index on `key`.
  //    Mongoose names a plain `unique: true` field index "<field>_1".
  for (const legacy of ["key_1"]) {
    if (names.includes(legacy)) {
      try {
        await col.dropIndex(legacy);
        console.log(`dropped legacy index ${legacy}`);
      } catch (err) {
        // A non-unique leftover index is harmless; only a failed unique
        // drop blocks the migration, and that case is caught below when the
        // compound index is created.
        console.warn(`could not drop ${legacy}:`, (err as Error).message);
      }
    }
  }

  // 2. Create the compound unique index.
  try {
    await col.createIndex({ key: 1, locale: 1 }, { unique: true, name: "key_1_locale_1" });
    console.log("ensured compound unique index { key, locale }");
  } catch (err) {
    throw new Error(
      `could not create the compound unique index - the legacy unique index on "key" ` +
        `is probably still present: ${(err as Error).message}`
    );
  }

  // 3. Backfill locale on rows written before bilingual editing.
  const backfilled = await col.updateMany(
    { $or: [{ locale: { $exists: false } }, { locale: "" }] },
    { $set: { locale: "en" } }
  );
  console.log(`backfilled locale="en" on ${backfilled.modifiedCount} row(s)`);

  // 4. Report, so the operator can see the starting point for translating.
  const [mr, en] = await Promise.all([
    col.countDocuments({ locale: "mr" }),
    col.countDocuments({ locale: "en" }),
  ]);
  console.log(`\nsite content rows - marathi: ${mr}, english: ${en}`);

  const products = await db.collection("products").countDocuments();
  const translated = await db
    .collection("products")
    .countDocuments({ "mr.name": { $exists: true, $nin: ["", null] } });
  console.log(`products - total: ${products}, with marathi copy: ${translated}`);
  console.log(
    translated < products
      ? "  (remaining products fall back to English per-field until translated)"
      : "  (catalogue fully translated)"
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});