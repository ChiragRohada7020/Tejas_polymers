import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { categories } from "@/lib/seed-data";
import { products1 } from "@/lib/seed-products-a";
import { products2 } from "@/lib/seed-products-b";
import { SiteContent } from "@/lib/models/SiteContent";
import { CONTENT_DEFS } from "@/lib/site-content";

const allProducts = [...products1, ...products2].map((p) => ({ ...p, specs: { ...p.specs } }));

export type SeedOptions = {
  /**
   * Overwrite every site-content key with the defaultValue declared in
   * site-content.ts. WITHOUT this, existing rows are left untouched (the
   * normal, non-destructive behaviour) so admin edits survive a re-seed.
   * Use this after changing defaults in code, otherwise the live site keeps
   * serving the old copy forever.
   */
  forceContent?: boolean;
};

export async function seedDatabase(
  options: SeedOptions = {}
): Promise<{ products: number; categories: number; content: number; contentReset: number }> {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  await Category.insertMany(categories as unknown as Record<string, unknown>[]);
  await Product.insertMany(allProducts as unknown as Record<string, unknown>[]);

  let contentReset = 0;
  if (options.forceContent) {
    // Drop keys we manage so $setOnInsert below re-creates them from the
    // current defaults. Unknown keys are preserved.
    const { deletedCount } = await SiteContent.deleteMany({
      key: { $in: CONTENT_DEFS.map((d) => d.key) },
    });
    contentReset = deletedCount ?? 0;
  }

  // Non-destructive by default: only inserts content keys that don't exist yet.
  const ops = CONTENT_DEFS.map((d) => ({
    updateOne: {
      filter: { key: d.key },
      update: { $setOnInsert: { key: d.key, value: d.defaultValue, kind: d.kind } },
      upsert: true,
    },
  }));
  const contentResult = await SiteContent.bulkWrite(ops, { ordered: false });

  return {
    products: allProducts.length,
    categories: categories.length,
    content: contentResult.upsertedCount,
    contentReset,
  };
}


