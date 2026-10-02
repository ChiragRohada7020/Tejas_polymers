import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * Proves the visual editor's write path is safe on a bilingual store.
 *
 * The real risk after adding a `locale` column is an upsert matching the
 * wrong row and overwriting the other language. This performs the exact
 * updateOne({ key, locale }, ..., { upsert: true }) the PUT endpoint uses,
 * on a throwaway key, and asserts the English row is untouched.
 *
 * Cleans up after itself.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";
const PROBE_KEY = "__i18n_write_probe__";

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20_000 });
  const col = mongoose.connection.db!.collection("sitecontents");

  await col.deleteMany({ key: PROBE_KEY });

  // Seed an English row, as a pre-migration row would look.
  await col.updateOne(
    { key: PROBE_KEY, locale: "en" },
    { $set: { value: "ENGLISH-ORIGINAL", kind: "text", locale: "en" } },
    { upsert: true }
  );

  // Now the Marathi write, exactly as the editor performs it.
  await col.updateOne(
    { key: PROBE_KEY, locale: "mr" },
    { $set: { value: "MARATHI-NEW", kind: "text", locale: "mr" } },
    { upsert: true }
  );

  const rows = await col.find({ key: PROBE_KEY }).toArray();
  console.log(`rows for the probe key: ${rows.length} (expected 2)`);
  for (const r of rows) console.log(`  ${r.locale} = ${r.value}`);

  const en = rows.find((r) => r.locale === "en");
  const mr = rows.find((r) => r.locale === "mr");

  const ok =
    rows.length === 2 && en?.value === "ENGLISH-ORIGINAL" && mr?.value === "MARATHI-NEW";

  // Re-running the editor save must update in place, not create a 3rd row.
  await col.updateOne(
    { key: PROBE_KEY, locale: "mr" },
    { $set: { value: "MARATHI-EDITED", kind: "text", locale: "mr" } },
    { upsert: true }
  );
  const after = await col.find({ key: PROBE_KEY }).toArray();
  const mr2 = after.find((r) => r.locale === "mr");
  const stable = after.length === 2 && mr2?.value === "MARATHI-EDITED";
  console.log(`\nrepeat save stays at ${after.length} rows, value = ${mr2?.value}`);

  await col.deleteMany({ key: PROBE_KEY });
  const cleaned = await col.countDocuments({ key: PROBE_KEY });
  console.log(`cleanup: ${cleaned} probe rows remaining`);

  await mongoose.disconnect();

  if (ok && stable) {
    console.log("\nPASS: locale-scoped upsert keeps the two languages independent");
  } else {
    console.error("\nFAIL: the upsert is clobbering or duplicating rows");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});