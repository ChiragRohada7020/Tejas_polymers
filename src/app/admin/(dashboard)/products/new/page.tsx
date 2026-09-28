import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
      <p className="mt-1 text-sm text-slate-500">Fields marked * are required.</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ProductForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </div>
    </div>
  );
}
