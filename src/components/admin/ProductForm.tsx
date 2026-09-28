"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Spec = { key: string; value: string };

export type ProductFormData = {
  _id?: string;
  name: string;
  slug?: string;
  category: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  rank: number;
  specs: Record<string, string>;
  price: string;
  minOrderQty: string;
  featured: boolean;
};

export default function ProductForm({
  categories,
  initial,
}: {
  categories: { slug: string; name: string }[];
  initial?: ProductFormData;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?._id);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [rank, setRank] = useState(String(initial?.rank ?? 999));
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [minOrderQty, setMinOrderQty] = useState(initial?.minOrderQty ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [specs, setSpecs] = useState<Spec[]>(
    Object.entries(initial?.specs ?? {}).map(([key, value]) => ({ key, value }))
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  async function onPickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (!res.ok || !data?.ok || !data.url) {
        throw new Error(data?.error || "Upload failed.");
      }
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specsObj[s.key.trim()] = s.value;
    });

    const payload = {
      name,
      slug: slug || undefined,
      category,
      shortDescription,
      description,
      imageUrl,
      rank: Number.isNaN(parseInt(rank, 10)) ? 999 : Math.max(0, parseInt(rank, 10)),
      price,
      minOrderQty,
      featured,
      specs: specsObj,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${initial?._id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Save failed.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="p-name">Product Name *</label>
          <input id="p-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls} htmlFor="p-slug">URL Slug (auto if blank)</label>
          <input id="p-slug" className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. battery-sprayer-16l" />
        </div>
        <div>
          <label className={labelCls} htmlFor="p-category">Category *</label>
          <select id="p-category" className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="p-short">Short Description * (shown on cards)</label>
          <textarea id="p-short" className={inputCls} rows={2} maxLength={300} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="p-desc">Full Description</label>
          <textarea id="p-desc" className={inputCls} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Product Image</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onPickImage}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : imageUrl ? "Change Image" : "Upload Image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                Remove
              </button>
            )}
          </div>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Product preview"
              className="mt-3 h-28 w-28 rounded-lg border border-slate-200 object-cover"
            />
          )}
        </div>
        <div>
          <label className={labelCls} htmlFor="p-rank">Display Order</label>
          <input
            id="p-rank"
            type="number"
            min={0}
            className={inputCls}
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="999"
          />
          <p className="mt-1 text-xs text-slate-500">Lower numbers show first (e.g. 1, 2, 3).</p>
        </div>
        <div>
          <label className={labelCls} htmlFor="p-price">Price Text</label>
          <input id="p-price" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. Contact for distributor pricing" />
        </div>
        <div>
          <label className={labelCls} htmlFor="p-moq">Minimum Order Qty</label>
          <input id="p-moq" className={inputCls} value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="e.g. 25 units" />
        </div>

      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Specifications</label>
          <button
            type="button"
            onClick={() => setSpecs([...specs, { key: "", value: "" }])}
            className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            + Add Spec
          </button>
        </div>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputCls} sm:w-1/3`}
                placeholder="Label (e.g. Tank Capacity)"
                value={spec.key}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], key: e.target.value };
                  setSpecs(next);
                }}
              />
              <input
                className={inputCls}
                placeholder="Value (e.g. 16 litres)"
                value={spec.value}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], value: e.target.value };
                  setSpecs(next);
                }}
              />
              <button
                type="button"
                onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                className="rounded-lg bg-red-50 px-3 text-sm font-bold text-red-600 hover:bg-red-100"
                aria-label="Remove spec"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Show as Featured on homepage
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
