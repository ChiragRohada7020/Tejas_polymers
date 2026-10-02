import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

/**
 * Lists every product's slug + imageUrl so the current state can be
 * verified before anything is written. Read-only.
 */
async function main() {
  const { connectDB } = await import("../src/lib/db");
  await connectDB();
  const { Product } = await import("../src/lib/models/Product");

  const all = await Product.find({})
    .sort({ category: 1, rank: 1 })
    .select("name slug imageUrl")
    .lean();

  console.log(`total products: ${all.length}\n`);

  for (const p of all) {
    const kind = p.imageUrl.startsWith("/api/media/")
      ? "TELEGRAM"
      : p.imageUrl.startsWith("/images/products/")
        ? "local   "
        : "other   ";
    console.log(`${kind}  ${p.imageUrl}`);
    console.log(`         ${p.slug}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.stack : e);
  process.exit(1);
});