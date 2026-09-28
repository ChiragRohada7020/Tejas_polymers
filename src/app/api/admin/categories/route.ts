import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Category } from "@/lib/models/Category";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { name?: string; description?: string };
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    await connectDB();

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return NextResponse.json({ error: "This category already exists." }, { status: 409 });
    }

    const category = await Category.create({
      name,
      slug,
      description: (body.description || "").trim(),
    });

    return NextResponse.json({ ok: true, category });
  } catch (err) {
    console.error("Create category failed:", err);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
