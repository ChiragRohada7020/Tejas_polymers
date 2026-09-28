"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function InquiryForm({
  productId,
  productName,
  variant = "distributor",
  compact = false,
}: {
  productId?: string;
  productName?: string;
  variant?: "general" | "distributor" | "product";
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId, productName, type: variant }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      form.reset();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-2xl text-white">
          ✓
        </div>
        <h3 className="mt-4 text-lg font-semibold text-brand-900">Thank you!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Your {variant === "distributor" ? "distributor application" : "inquiry"} has been
          received. Our sales team will get back to you within 1–2 business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-brand-700 underline hover:text-brand-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      {productName && (
        <input type="hidden" name="productName" value={productName} />
      )}

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor="inq-name" className={labelCls}>Full Name *</label>
          <input id="inq-name" name="name" required className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="inq-email" className={labelCls}>Email *</label>
          <input id="inq-email" name="email" type="email" required className={inputCls} placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="inq-phone" className={labelCls}>Phone / WhatsApp</label>
          <input id="inq-phone" name="phone" className={inputCls} placeholder="+91 ..." />
        </div>
        <div>
          <label htmlFor="inq-company" className={labelCls}>
            {variant === "distributor" ? "Company / Firm Name" : "Company (optional)"}
          </label>
          <input id="inq-company" name="company" className={inputCls} placeholder="Company name" />
        </div>
        {variant === "distributor" && (
          <div className="sm:col-span-2">
            <label htmlFor="inq-country" className={labelCls}>Country / Region you want to distribute in *</label>
            <input id="inq-country" name="country" required className={inputCls} placeholder="e.g. Kenya, Punjab (India), Brazil" />
          </div>
        )}
        {variant !== "distributor" && (
          <div className={variant === "general" ? "sm:col-span-2" : ""}>
            <label htmlFor="inq-country" className={labelCls}>Country (optional)</label>
            <input id="inq-country" name="country" className={inputCls} placeholder="Your country" />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="inq-message" className={labelCls}>
          {variant === "distributor" ? "Tell us about your business *" : "Message *"}
        </label>
        <textarea
          id="inq-message"
          name="message"
          required
          rows={variant === "distributor" ? 4 : 5}
          className={inputCls}
          placeholder={
            variant === "distributor"
              ? "Existing business, customer network, years in agri trade, brands you carry..."
              : "Tell us what you need — quantities, product models, delivery location..."
          }
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting"
          ? "Sending..."
          : variant === "distributor"
            ? "Apply to Become a Distributor"
            : "Send Inquiry"}
      </button>
    </form>
  );
}
