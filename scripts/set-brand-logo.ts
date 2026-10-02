/**
 * Points `brand.logoImage` at the supplied logo for every locale.
 *
 * The code default in CONTENT_DEFS only applies where no row exists, and the
 * i18n migration backfilled all 110 pre-existing keys - including this one -
 * with an empty value. Without this the site keeps rendering the old text
 * wordmark even though the asset is present.
 *
 * Only touches the logo key, so no other content is at risk.
 */
import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";
const KEY = "brand.logoImage";
const VALUE = "/images/brand/krusheebindoo-logo.png";

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20_000 });
  const col = mongoose.connection.db!.collection("sitecontents");

  const before = await col.find({ key: KEY }).toArray();
  console.log(`\nexisting rows for ${KEY}: ${before.length}`);
  for (const row of before) {
    console.log(`  ${row.locale} = ${JSON.stringify(row.value)}`);
  }

  for (const locale of ["mr", "en"]) {
    await col.updateOne(
      { key: KEY, locale },
      { $set: { value: VALUE, kind: "image" } },
      { upsert: true }
    );
    console.log(`  set ${locale} -> ${VALUE}`);
  }

  const after = await col.find({ key: KEY }).toArray();
  console.log(`\nrows now: ${after.length}`);
  for (const row of after) {
    console.log(`  ${row.locale} = ${JSON.stringify(row.value)}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});