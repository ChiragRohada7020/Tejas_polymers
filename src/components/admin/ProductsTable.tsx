"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  imageUrl: string;
  rank: number;
  featured: boolean;
};

export default function ProductsTable({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  async function toggleFeatured(id: string, featured: boolean) {
    setBusyId(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
        <p className="font-medium text-slate-700">No products found</p>
        <p className="mt-1 text-sm text-slate-500">Add your first product to start building the catalog.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>
    );
  }

  return (
    <div className={busyId ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {products.map((p) => (
            <li key={p._id}>
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                      {categoryName(p.category)}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-200">
                        Featured
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500" title="Display order on the website">
                      #{p.rank}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    /{p.slug}
                    {p.price ? ` · ${p.price}` : ""}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p._id, p.featured)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                  >
                    {p.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p._id, p.name)}
                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
