import type { Metadata } from "next";
import Link from "next/link";
import { getCachedCategories, getCachedProducts } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { EditableLink, EditableRichText, EditableText } from "@/components/site/Editable";
import { content, getSiteContentMap } from "@/lib/site-content";
import AdminChrome from "@/components/site/AdminChrome";

export const revalidate = 60;
  // Edit state is resolved client-side (see EditModeContext).
  const editMode = false;

export const metadata: Metadata = {
  title: "Drip Irrigation Products — Inline Drip, Emitters, Filters & Fittings",
  description:
    "Browse Krusheebindoo by Tejas Polymers: IS 13488 certified flat inline drip laterals in 12 mm and 16 mm, online drippers 4 and 8 LPH, pressure-compensating emitters, screen and disc filters, grommets, end caps and take-off connectors. Manufacturer pricing for dealers in Jalgaon, Dhule, Nandurbar and across Maharashtra.",
  keywords: [
    "flat inline drip 12mm",
    "flat inline drip 16mm",
    "online drip emitter 4 LPH",
    "online drip emitter 8 LPH",
    "PC pressure compensating emitter",
    "drip screen filter 2 inch",
    "drip disc filter",
    "drip take off connector",
    "drip lateral grommet",
    "drip irrigation fittings",
  ],
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "", q = "" } = await searchParams;

  const [categories, allProducts, map] = await Promise.all([
    getCachedCategories(),
    getCachedProducts(),
    getSiteContentMap(),
  ]);

  // Filter and search in JS against the cached list - far cheaper than a
  // database round trip per request. Fifteen products is small enough
  // that this is the right trade.
  const needle = q.trim().toLowerCase();
  const products = allProducts.filter((p) => {
    if (category && p.category !== category) return false;
    if (!needle) return true;
    return [p.name, p.shortDescription, p.category]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(needle));
  });

  const t = (key: string) => content(map, key);
  const activeCat = categories.find((c) => c.slug === category);

  return (
    <>
      <Reveal />
      {/* Page header */}
      <section className="wave-bg border-b border-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
            <Link href="/" className="hover:text-brand-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-900">Products</span>
            {activeCat && (
              <>
                <span className="mx-2">/</span>
                <span className="text-brand-900">{activeCat.name}</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl font-extrabold text-brand-950 sm:text-4xl">
            {activeCat ? (
              activeCat.name
            ) : (
              <EditableText contentKey="products.heroTitle" editMode={editMode} value={t("products.heroTitle")} as="span" />
            )}
          </h1>
          <div className="mt-3 max-w-2xl text-slate-700">
            {activeCat ? (
              activeCat.description
            ) : (
              <EditableRichText contentKey="products.heroBody" editMode={editMode} value={t("products.heroBody")} />
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !category
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={String(c._id)}
                href={`/products?category=${c.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === c.slug
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <form action="/products" method="get" className="flex gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 lg:w-64"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-slate-500" role="status">
            {products.length} product{products.length === 1 ? "" : "s"} found
            {q && <> for &ldquo;{q}&rdquo;</>}
          </p>
          <AdminChrome>
            <Link
              href="/admin/products/new"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
            >
              + Add New Product
            </Link>
          </AdminChrome>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
            <p className="text-lg font-medium text-slate-700">No products match your search.</p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different keyword or{" "}
              <Link href="/products" className="font-semibold text-brand-700 underline">
                browse all products
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={String(p._id)} product={p} editMode={editMode} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-brand-50 px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-brand-900">
            <EditableText contentKey="products.ctaTitle" editMode={editMode} value={t("products.ctaTitle")} as="span" />
          </h2>
          <div className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            <EditableRichText contentKey="products.ctaBody" editMode={editMode} value={t("products.ctaBody")} />
          </div>
          {editMode ? (
            <span className="mt-6 inline-block rounded-xl bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow">
              <EditableLink
                labelKey="products.ctaButton"
                hrefKey="products.ctaHref"
                editMode
                label={t("products.ctaButton")}
                href={t("products.ctaHref")}
              />
            </span>
          ) : (
            <Link
              href={t("products.ctaHref")}
              className="mt-6 inline-block rounded-xl bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-700"
            >
              {t("products.ctaButton")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
