import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models/Inquiry";
import { notifyNewInquiry, sendInquiryAutoReply } from "@/lib/mailer";
import type { InquiryType } from "@/lib/emails/inquiry";

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
    const type: InquiryType = ["general", "distributor", "product"].includes(body.type || "")
      ? (body.type as InquiryType)
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
    const created = await Inquiry.create({
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

    // The inquiry is safely stored at this point, so everything below is
    // best-effort. A failed email must NOT fail the request, otherwise the
    // visitor sees an error for a message we actually received.
    const payload = {
      name,
      email,
      phone,
      company,
      country,
      message,
      type,
      productName,
      createdAt: created.createdAt,
    };

    try {
      const [notifyResult] = await Promise.all([
        notifyNewInquiry(payload),
        sendInquiryAutoReply(payload),
      ]);

      await Inquiry.updateOne(
        { _id: created._id },
        notifyResult.sent
          ? { $set: { notified: true, notifiedAt: new Date(), notifyError: "" } }
          : { $set: { notified: false, notifyError: notifyResult.error || "" } }
      );

      if (!notifyResult.sent) {
        console.warn("Inquiry notification not sent:", notifyResult.error);
      }
    } catch (mailErr) {
      // The status update is best-effort as well. The inquiry is already
      // stored, so the visitor must still get a success response.
      console.error("Inquiry email step failed:", mailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inquiry failed:", err);
    return NextResponse.json(
      { error: "Could not send your inquiry. Please try again later." },
      { status: 500 }
    );
  }
}