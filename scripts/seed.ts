import { config } from "dotenv";

// IMPORTANT: static imports are hoisted, so importing "../src/lib/seed" here
// would load src/lib/db.ts and read process.env.MONGODB_URI *before* dotenv
// ran — silently falling back to localhost. Use a dynamic import instead.
config({ path: ".env.local" });

// --force-content overwrites every site-content key with the defaults declared
// in src/lib/site-content.ts. Required after changing that file, otherwise the
// existing rows are preserved and the site keeps serving the old copy.
const forceContent = process.argv.includes("--force-content");

import("../src/lib/seed")
  .then(({ seedDatabase }) => seedDatabase({ forceContent }))
  .then((r) => {
    console.log(`✅ Seeded ${r.categories} categories and ${r.products} products.`);
    if (r.contentReset > 0) {
      console.log(`✅ Reset ${r.contentReset} site content key(s) to current defaults (--force-content).`);
    }
    console.log(`✅ Site content keys present (${r.content} inserted, existing edits preserved).`);
    console.log(
      `✅ Target: ${(process.env.MONGODB_URI || "").replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")}`
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
