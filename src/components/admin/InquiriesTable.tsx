"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusPill from "@/components/admin/StatusPill";
import { formatDateTimeUTC, initials } from "@/lib/format";

export type AdminInquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  productName: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
};

const TYPE_STYLE: Record<string, string> = {
  distributor: "bg-amber-100 text-amber-800",
  product: "bg-brand-100 text-brand-700",
  general: "bg-slate-100 text-slate-600",
};

export default function InquiriesTable({ inquiries }: { inquiries: AdminInquiry[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    setBusyId(id);
    await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177c-.066.214-.1.437-.1.661z" />
          </svg>
        </div>
        <p className="font-medium text-slate-700">No inquiries match your filters</p>
        <p className="mt-1 text-sm text-slate-500">New form submissions will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className={busyId ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {inquiries.map((q) => (
            <li key={q._id}>
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {initials(q.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{q.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${TYPE_STYLE[q.type] ?? TYPE_STYLE.general}`}>
                      {q.type}
                    </span>
                    {q.productName && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">→ {q.productName}</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {q.email}
                    {q.phone ? ` · ${q.phone}` : ""}
                    {q.company ? ` · ${q.company}` : ""}
                    {q.country ? ` · ${q.country}` : ""}
                  </p>
                </div>
                <span className="hidden text-xs text-slate-400 xl:block">{formatDateTimeUTC(q.createdAt)}</span>
                <StatusPill status={q.status} />
                <select
                  value={q.status}
                  onChange={(e) => setStatus(q._id, e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs capitalize outline-none focus:border-brand-500"
                  aria-label="Change status"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="closed">closed</option>
                </select>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === q._id ? null : q._id)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    {openId === q._id ? "Hide" : "View"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(q._id)}
                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {openId === q._id && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{q.message}</p>
                  <p className="mt-2 text-xs text-slate-400">Received {formatDateTimeUTC(q.createdAt)} (UTC)</p>
                  <a
                    href={`mailto:${q.email}?subject=Re: your inquiry to AgriGrid Industries`}
                    className="mt-3 inline-block rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Reply by Email
                  </a>
                </div>
              )}
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
}
