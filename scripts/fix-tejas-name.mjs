/**
 * One-off source repair: the Marathi transliteration of the company name was
 * written "तेजा पॉलिमर्स" (te-jā = "Teja"), dropping the "s" from "Tejas".
 * The correct Devanagari is "तेजस पॉलिमर्स" (te-jas). This rewrites every
 * Marathi occurrence across src/**\/*.{ts,tsx}, including inflected forms
 * ("तेजा पॉलिमर्सचे", "तेजा पॉलिमर्सबद्दल") since those contain the base
 * substring. Idempotent: a second run finds nothing to change.
 *
 * Run with:  node scripts/fix-tejas-name.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const WRONG = "\u0924\u0947\u091C\u093E \u092A\u0949\u0932\u093F\u092E\u0930\u094D\u0938"; // तेजा पॉलिमर्स
const RIGHT = "\u0924\u0947\u091C\u0938 \u092A\u0949\u0932\u093F\u092E\u0930\u094D\u0938"; // तेजस पॉलिमर्स

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) yield full;
  }
}

let filesChanged = 0;
let replacements = 0;

for await (const file of walk("src")) {
  const original = await readFile(file, "utf8");
  if (!original.includes(WRONG)) continue;
  const count = original.split(WRONG).length - 1;
  const updated = original.split(WRONG).join(RIGHT);
  // Write UTF-8 without a BOM so we don't corrupt the source encoding.
  await writeFile(file, updated, { encoding: "utf8" });
  filesChanged += 1;
  replacements += count;
  console.log(`  ${file}  (${count} occurrence${count === 1 ? "" : "s"})`);
}

console.log(
  `\n${replacements} replacement(s) across ${filesChanged} file(s).${
    replacements === 0 ? " Nothing to do." : ""
  }`
);
