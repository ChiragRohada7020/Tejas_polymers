import { config } from "dotenv";
config({ path: ".env.local" });

import { seedDatabase } from "../src/lib/seed";

seedDatabase()
  .then((r) => {
    console.log(`✅ Seeded ${r.categories} categories and ${r.products} products.`);
    console.log(`✅ Site content keys present (${r.content} inserted, existing edits preserved).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
