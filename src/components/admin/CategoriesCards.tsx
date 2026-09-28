"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
};

export default function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not create category.");
      setBusy(false);
      return;
    }

    setName("");
    setDescription("");
    setBusy(false);
    router.refresh();
  }

  async function remove(id: string, categoryName: string) {
    if (!confirm(`Delete "${categoryName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError(null);

    const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not delete category.");
    }

    setDeletingId(null);
    router.refresh();
  }

  return (
    <div>
      <form
        onSubmit={addCategory}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-48 flex-1">
          <label htmlFor="category-name" className="mb-1 block text-xs font-semibold text-slate-600">
            Category name *
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprayers"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="min-w-56 flex-[2]">
          <label htmlFor="category-description" className="mb-1 block text-xs font-semibold text-slate-600">
            Description
          </label>
          <input
            id="category-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short line shown on the site"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={busy || name.trim().length === 0}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adding..." : "+ Add category"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <p className="font-medium text-slate-700">No categories yet</p>
          <p className="mt-1 text-sm text-slate-500">Add one above to organize your product catalog.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c._id}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-black text-brand-700">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">/{c.slug}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{c.description || "No description"}</p>
                <p className="mt-1.5 text-xs font-medium text-slate-500">
                  {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(c._id, c.name)}
                disabled={deletingId === c._id}
                className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {deletingId === c._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
