import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import CategoryManager from "@/components/admin/CategoriesCards";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();

  const withCounts = await Promise.all(
    categories.map(async (c) => ({
      _id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      productCount: await Product.countDocuments({ category: c.slug }),
    }))
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            {withCounts.length} {withCounts.length === 1 ? "category" : "categories"} · used to organize the product
            catalog shown to distributors
          </p>
        </div>
      </div>

      <div className="mt-5">
        <CategoryManager categories={withCounts} />
      </div>
    </div>
  );
}
