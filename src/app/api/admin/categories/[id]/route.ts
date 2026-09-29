import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { invalidateCatalogCache } from "@/lib/catalog";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const inUse = await Product.countDocuments({ category: category.slug });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${inUse} product(s) use this category. Move or delete them first.` },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);
    // Keep the cached catalogue in step with the edit just made.
  invalidateCatalogCache();
  return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete category." }, { status: 500 });
  }
}
