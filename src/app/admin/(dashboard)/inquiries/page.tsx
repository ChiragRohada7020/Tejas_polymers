import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models/Inquiry";
import InquiriesTable from "@/components/admin/InquiriesTable";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "new", "contacted", "closed"] as const;
const TYPES = ["all", "distributor", "product", "general"] as const;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes((sp.status ?? "all") as (typeof STATUSES)[number]) ? sp.status ?? "all" : "all";
  const type = TYPES.includes((sp.type ?? "all") as (typeof TYPES)[number]) ? sp.type ?? "all" : "all";
  const q = (sp.q ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (status !== "all") filter.status = status;
  if (type !== "all") filter.type = type;
  if (q) {
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: new RegExp(esc, "i") },
      { email: new RegExp(esc, "i") },
      { company: new RegExp(esc, "i") },
      { message: new RegExp(esc, "i") },
    ];
  }

  await connectDB();
  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const counts = {
    all: await Inquiry.countDocuments({}),
    new: await Inquiry.countDocuments({ status: "new" }),
    contacted: await Inquiry.countDocuments({ status: "contacted" }),
    closed: await Inquiry.countDocuments({ status: "closed" }),
  };

  const tabHref = (s: string) => {
    const p = new URLSearchParams();
    if (s !== "all") p.set("status", s);
    if (type !== "all") p.set("type", type);
    if (q) p.set("q", q);
    const qs = p.toString();
    return `/admin/inquiries${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
          <p className="mt-1 text-sm text-slate-500">
            {inquiries.length} shown{q ? ` for "${q}"` : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={tabHref(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              status === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "all" ? "All" : s}
            <span className={`ml-1.5 text-xs ${status === s ? "text-slate-300" : "text-slate-400"}`}>
              {counts[s as keyof typeof counts]}
            </span>
          </Link>
        ))}
      </div>

      <form action="/admin/inquiries" method="get" className="mt-4 flex flex-wrap items-center gap-2">
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-brand-500"
          aria-label="Filter by type"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All types" : t}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, message..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 sm:w-72"
          aria-label="Search inquiries"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Apply
        </button>
        {(q || type !== "all") && (
          <Link href={`/admin/inquiries${status !== "all" ? `?status=${status}` : ""}`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-5">
        <InquiriesTable
          inquiries={inquiries.map((iq) => ({
            _id: String(iq._id),
            name: iq.name,
            email: iq.email,
            phone: iq.phone ?? "",
            company: iq.company ?? "",
            country: iq.country ?? "",
            productName: iq.productName ?? "",
            message: iq.message,
            type: iq.type,
            status: iq.status,
            createdAt: iq.createdAt ? new Date(iq.createdAt).toISOString() : "",
          }))}
        />
      </div>
    </div>
  );
}
