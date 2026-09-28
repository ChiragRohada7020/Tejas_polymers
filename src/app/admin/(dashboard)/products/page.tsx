import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = (sp.category ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) {
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: new RegExp(esc, "i") }, { slug: new RegExp(esc, "i") }];
  }

  await connectDB();
  const [products, categories] = await Promise.all([
    Product.find(filter).sort({ rank: 1, createdAt: -1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} product{products.length === 1 ? "" : "s"}
            {q ? ` matching "${q}"` : ""}
            {category ? ` in ${categories.find((c) => c.slug === category)?.name ?? category}` : ""}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mt-5 flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500 sm:w-72"
          aria-label="Search products"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Apply
        </button>
        {(q || category) && (
          <Link href="/admin/products" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-5">
        <ProductsTable
          products={products.map((p) => ({
            _id: String(p._id),
            name: p.name,
            slug: p.slug,
            category: p.category,
            price: p.price ?? "",
            imageUrl: p.imageUrl ?? "",
            rank: Number.isFinite(Number(p.rank)) ? Number(p.rank) : 999,
            featured: Boolean(p.featured),
          }))}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>
    </div>
  );
}
