import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  if (!product) notFound();

  const initial: ProductFormData = {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    rank: Number.isFinite(Number(product.rank)) ? Number(product.rank) : 999,
    specs: Object.fromEntries(
      Object.entries(product.specs ?? {}).map(([k, v]) => [k, String(v)])
    ),
    price: product.price ?? "",
    minOrderQty: product.minOrderQty ?? "",
    featured: Boolean(product.featured),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} initial={initial} />
      </div>
    </div>
  );
}
