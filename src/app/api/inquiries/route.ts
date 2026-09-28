import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models/Inquiry";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string | undefined>;

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const company = (body.company || "").trim();
    const country = (body.country || "").trim();
    const message = (body.message || "").trim();
    const type = ["general", "distributor", "product"].includes(body.type || "")
      ? (body.type as string)
      : "general";
    const productName = (body.productName || "").trim();
    const productId = body.productId || undefined;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please write a message of at least 10 characters." },
        { status: 400 }
      );
    }
    if (type === "distributor" && !country) {
      return NextResponse.json(
        { error: "Please tell us which country/region you want to distribute in." },
        { status: 400 }
      );
    }

    await connectDB();
    await Inquiry.create({
      name,
      email,
      phone,
      company,
      country,
      message,
      type,
      productName,
      ...(productId ? { productId } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inquiry failed:", err);
    return NextResponse.json(
      { error: "Could not send your inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
