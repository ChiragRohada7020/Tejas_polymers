import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Product } from "@/lib/models/Product";
import { invalidateCatalogCache } from "@/lib/catalog";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const shortDescription = String(body.shortDescription || "").trim();

    if (!name || !category || !shortDescription) {
      return NextResponse.json(
        { error: "Name, category and short description are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = String(body.slug || "").trim() || slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }

    const specs =
      typeof body.specs === "object" && body.specs !== null
        ? Object.fromEntries(
            Object.entries(body.specs as Record<string, unknown>)
              .filter(([, v]) => String(v).trim() !== "")
              .map(([k, v]) => [k.trim(), String(v).trim()])
          )
        : {};

    const product = await Product.create({
      name,
      slug,
      category,
      shortDescription,
      description: String(body.description || shortDescription),
      imageUrl: String(body.imageUrl || ""),
      rank: Number.isFinite(Number(body.rank)) ? Math.max(0, Number(body.rank)) : 999,
      specs,
      price: String(body.price || ""),
      minOrderQty: String(body.minOrderQty || ""),
      featured: Boolean(body.featured),
    });

    // Keep the cached catalogue in step with the edit just made.
  invalidateCatalogCache();
  return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("Create product failed:", err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
