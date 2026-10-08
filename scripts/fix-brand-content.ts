import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * Repairs two faults in the stored content, both of which the code cannot fix
 * on its own because a stored value always wins over a code default.
 *
 * 1. THE BRAND NAME WAS TRANSLITERATED WRONG.
 *    "Krusheebindoo" was written into Marathi as "कृष्हीबिंडू" - a stray
 *    हलंत after कृ, and ड instead of द. The correct Marathi is "कृषीबिंदू".
 *    Every Marathi value holding the wrong form is rewritten, in site
 *    content, product names/short descriptions and category names. Latin
 *    brand strings ("Krusheebindoo") are deliberately left alone: the trade
 *    name stays in Latin everywhere else on purpose.
 *
 * 2. brand.logoImage WAS BACKFILLED AS AN EMPTY STRING.
 *    The bilingual migration created a row for every key in both locales,
 *    with an empty value. An empty image value meant BrandMark rendered the
 *    text wordmark instead of the supplied logo, so /mr never showed the
 *    logo the owner uploaded. Blank rows are re-pointed at the asset the
 *    code default in CONTENT_DEFS names, and a missing row is created.
 *    A row that already holds a real path (e.g. an admin's own upload) is
 *    never touched.
 *
 * Idempotent: re-running finds nothing left to change.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

/** कृष्हीबिंडू */
const WRONG = "\u0915\u0943\u0937\u094D\u0939\u0940\u092C\u093F\u0902\u0921\u0942";
/** कृषीबिंदू */
const RIGHT = "\u0915\u0943\u0937\u0940\u092C\u093F\u0902\u0926\u0942";

const LOGO_KEY = "brand.logoImage";
/** Must match `I("brand.logoImage", ...)` in src/lib/site-content.ts. */
const LOGO_VALUE = "/images/brand/krusheebindoo-logo.png";

/** Field paths that can carry the brand name, per collection. */
const TEXT_FIELDS: Record<string, string[]> = {
  sitecontents: ["value"],
  products: [
    "name",
    "shortDescription",
    "description",
    "mr.name",
    "mr.shortDescription",
    "mr.description",
  ],
  categories: ["name", "nameMr"],
};

function readPath(doc: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, doc);
}

async function repairSpelling(db: mongoose.mongo.Db): Promise<number> {
  let totalChanged = 0;

  for (const [name, fields] of Object.entries(TEXT_FIELDS)) {
    const col = db.collection(name);
    const docs = await col.find({}).toArray();
    let changed = 0;

    for (const doc of docs) {
      const sets: Record<string, string> = {};
      for (const field of fields) {
        const value = readPath(doc as Record<string, unknown>, field);
        if (typeof value === "string" && value.includes(WRONG)) {
          sets[field] = value.split(WRONG).join(RIGHT);
        }
      }
      if (Object.keys(sets).length === 0) continue;

      await col.updateOne({ _id: doc._id }, { $set: sets });
      changed += 1;
      const label = doc.slug ?? doc.key ?? String(doc._id);
      for (const field of Object.keys(sets)) {
        console.log(`  ${name} "${label}" [${doc.locale ?? "-"}] .${field}`);
      }
    }

    console.log(`${name}: ${changed} of ${docs.length} document(s) repaired\n`);
    totalChanged += changed;
  }

  return totalChanged;
}

async function repairBlankLogo(db: mongoose.mongo.Db): Promise<number> {
  const col = db.collection("sitecontents");
  let changed = 0;

  const blanks = await col
    .find({ key: LOGO_KEY, $or: [{ value: "" }, { value: null }, { value: { $exists: false } }] })
    .toArray();

  for (const row of blanks) {
    const locale = typeof row.locale === "string" && row.locale ? row.locale : "en";
    await col.updateOne({ _id: row._id }, { $set: { value: LOGO_VALUE, kind: "image", locale } });
    console.log(`  brand.logoImage [${locale}] "" -> ${LOGO_VALUE}`);
    changed += 1;
  }

  // A locale with no row at all falls back to the code default, which is
  // already correct - but writing the row keeps the two languages visibly
  // identical in the admin editor.
  for (const locale of ["mr", "en"]) {
    const exists = await col.countDocuments({ key: LOGO_KEY, locale });
    if (exists === 0) {
      await col.updateOne(
        { key: LOGO_KEY, locale },
        { $set: { value: LOGO_VALUE, kind: "image", locale } },
        { upsert: true }
      );
      console.log(`  brand.logoImage [${locale}] missing -> ${LOGO_VALUE}`);
      changed += 1;
    }
  }

  console.log(`brand.logoImage: ${changed} row(s) repaired\n`);
  return changed;
}

/** Re-reads everything and reports anything still wrong. */
async function verify(db: mongoose.mongo.Db): Promise<boolean> {
  let remaining = 0;

  for (const [name, fields] of Object.entries(TEXT_FIELDS)) {
    const docs = await db.collection(name).find({}).toArray();
    for (const doc of docs) {
      for (const field of fields) {
        const value = readPath(doc as Record<string, unknown>, field);
        if (typeof value === "string" && value.includes(WRONG)) {
          remaining += 1;
          console.log(`  STILL WRONG: ${name}.${field} (${doc.slug ?? doc.key ?? doc._id})`);
        }
      }
    }
  }

  const logoRows = await db.collection("sitecontents").find({ key: LOGO_KEY }).toArray();
  for (const row of logoRows) {
    const ok = typeof row.value === "string" && row.value !== "";
    if (!ok) remaining += 1;
    console.log(
      `  brand.logoImage [${row.locale ?? "-"}] = ${JSON.stringify(row.value)}${ok ? "" : "  <-- STILL BLANK"}`
    );
  }

  console.log(
    remaining === 0
      ? "\nPASS: brand spelling corrected and the logo is set in every locale"
      : `\nFAIL: ${remaining} problem(s) remain`
  );
  return remaining === 0;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 25_000 });
  const db = mongoose.connection.db;
  if (!db) throw new Error("no database handle");

  console.log("\n--- spelling: कृष्हीबिंडू -> कृषीबिंदू ---");
  const spelling = await repairSpelling(db);

  console.log("--- logo image rows ---");
  const logo = await repairBlankLogo(db);

  console.log(`\ntotal: ${spelling} document(s) and ${logo} logo row(s) changed`);

  console.log("\n--- verify ---");
  const ok = await verify(db);

  await mongoose.disconnect();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
