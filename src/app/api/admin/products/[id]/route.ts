import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Product } from "@/lib/models/Product";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
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

    const specs =
      typeof body.specs === "object" && body.specs !== null
        ? Object.fromEntries(
            Object.entries(body.specs as Record<string, unknown>)
              .filter(([, v]) => String(v).trim() !== "")
              .map(([k, v]) => [k.trim(), String(v).trim()])
          )
        : {};

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        shortDescription,
        description: String(body.description || shortDescription),
        imageUrl: String(body.imageUrl || ""),
        rank: Number.isFinite(Number(body.rank)) ? Math.max(0, Number(body.rank)) : 999,
        specs,
        price: String(body.price || ""),
        minOrderQty: String(body.minOrderQty || ""),
        featured: Boolean(body.featured),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update product failed:", err);
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = (await request.json()) as { featured?: boolean };
    await connectDB();

    const patch: Record<string, boolean> = {};
    if (typeof body.featured === "boolean") patch.featured = body.featured;

    const updated = await Product.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, featured: updated.featured });
  } catch {
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete product." }, { status: 500 });
  }
}
