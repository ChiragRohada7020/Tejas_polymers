import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

/**
 * Repairs the Marathi transliteration of the company name in the STORED
 * content, which the code cannot fix on its own because a stored value always
 * wins over a code default.
 *
 * "Tejas Polymers" had been written into Marathi as "तेजा पॉलिमर्स"
 * (te-jā = "Teja"), dropping the "s". The correct Devanagari is
 * "तेजस पॉलिमर्स" (te-jas). Every stored value holding the wrong form is
 * rewritten across site content, product names/descriptions and category
 * names. Latin brand strings are left alone.
 *
 * The code defaults in src/ are corrected separately (scripts/fix-tejas-name.mjs);
 * this handles the rows that override them in the database.
 *
 * Idempotent: re-running finds nothing left to change.
 *
 * Run with:  npx tsx scripts/fix-tejas-db.ts
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agrigrid";

/** तेजा पॉलिमर्स */
const WRONG = "\u0924\u0947\u091C\u093E \u092A\u0949\u0932\u093F\u092E\u0930\u094D\u0938";
/** तेजस पॉलिमर्स */
const RIGHT = "\u0924\u0947\u091C\u0938 \u092A\u0949\u0932\u093F\u092E\u0930\u094D\u0938";

/** Field paths that can carry the company name, per collection. */
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

async function repair(db: mongoose.mongo.Db): Promise<number> {
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
      const id = (doc as Record<string, unknown>).slug ?? (doc as Record<string, unknown>).key ?? doc._id;
      const loc = (doc as Record<string, unknown>).locale ? `[${(doc as Record<string, unknown>).locale}]` : "";
      console.log(`  ${name} ${id}${loc}: ${Object.keys(sets).join(", ")}`);
    }

    totalChanged += changed;
  }

  return totalChanged;
}

async function verify(db: mongoose.mongo.Db): Promise<boolean> {
  let remaining = 0;

  for (const [name, fields] of Object.entries(TEXT_FIELDS)) {
    const docs = await db.collection(name).find({}).toArray();
    for (const doc of docs) {
      for (const field of fields) {
        const value = readPath(doc as Record<string, unknown>, field);
        if (typeof value === "string" && value.includes(WRONG)) {
          remaining += 1;
          const id = (doc as Record<string, unknown>).slug ?? (doc as Record<string, unknown>).key ?? doc._id;
          console.log(`  STILL WRONG: ${name}.${field} (${id})`);
        }
      }
    }
  }

  console.log(
    remaining === 0
      ? "\nPASS: company name corrected in every stored value"
      : `\nFAIL: ${remaining} problem(s) remain`
  );
  return remaining === 0;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 25_000 });
  const db = mongoose.connection.db;
  if (!db) throw new Error("no database handle");

  console.log("--- तेजा पॉलिमर्स -> तेजस पॉलिमर्स ---");
  const changed = await repair(db);
  console.log(`\n${changed} document(s) changed`);

  console.log("\n--- verify ---");
  const ok = await verify(db);

  await mongoose.disconnect();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
