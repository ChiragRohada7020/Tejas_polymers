import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { categories } from "@/lib/seed-data";
import { products1 } from "@/lib/seed-products-a";
import { products2 } from "@/lib/seed-products-b";
import { SiteContent } from "@/lib/models/SiteContent";
import { CONTENT_DEFS } from "@/lib/site-content";

const allProducts = [...products1, ...products2].map((p) => ({ ...p, specs: { ...p.specs } }));

export async function seedDatabase(): Promise<{ products: number; categories: number; content: number }> {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  await Category.insertMany(categories as unknown as Record<string, unknown>[]);
  await Product.insertMany(allProducts as unknown as Record<string, unknown>[]);

  // Non-destructive: only inserts content keys that don't exist yet.
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
  };
}


