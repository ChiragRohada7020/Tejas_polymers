import { config } from "dotenv";

// IMPORTANT: static imports are hoisted, so importing "../src/lib/seed" here
// would load src/lib/db.ts and read process.env.MONGODB_URI *before* dotenv
// ran — silently falling back to localhost. Use a dynamic import instead.
config({ path: ".env.local" });

import("../src/lib/seed")
  .then(({ seedDatabase }) => seedDatabase())
  .then((r) => {
    console.log(`✅ Seeded ${r.categories} categories and ${r.products} products.`);
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
