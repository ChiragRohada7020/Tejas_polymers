import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { writeFile } from "node:fs/promises";

async function main() {
  const { connectDB } = await import("../src/lib/db");
  await connectDB();
  const { Product } = await import("../src/lib/models/Product");
  const { Category } = await import("../src/lib/models/Category");

  const products = await Product.find({}).lean();
  const categories = await Category.find({}).lean();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = `scripts/catalog-backup-${stamp}.json`;

  await writeFile(
    file,
    JSON.stringify({ takenAt: new Date().toISOString(), products, categories }, null, 2),
    "utf8"
  );
  console.log(`backed up ${products.length} products + ${categories.length} categories`);
  console.log("written to", file);
  process.exit(0);
}
main().catch((e) => { console.error("FAILED:", e instanceof Error ? e.message : e); process.exit(1); });