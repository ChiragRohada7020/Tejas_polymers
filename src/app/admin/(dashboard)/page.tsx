import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models/Inquiry";
import { Product } from "@/lib/models/Product";
import StatCard from "@/components/admin/StatCard";
import StatusPill from "@/components/admin/StatusPill";
import DailyBarChart from "@/components/admin/charts/DailyBarChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import BarList from "@/components/admin/charts/BarList";
import { initials, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const TREND_DAYS = 14;
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Donut colors mirror StatusPill's dot colors so the chart and pills agree. */
const STATUS_COLORS: Record<string, string> = {
  new: "#f59e0b",
  contacted: "#3b82f6",
  closed: "#94a3b8",
};

const TYPE_BADGES: Record<string, string> = {
  distributor: "bg-brand-50 text-brand-700 ring-brand-200",
  product: "bg-blue-50 text-blue-700 ring-blue-200",
  general: "bg-slate-100 text-slate-600 ring-slate-200",
};

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function AdminDashboardPage() {
  await connectDB();

  // --- Catalogue + pipeline counts ---------------------------------------
  const [totalProducts, featuredProducts, totalInquiries, newCount, contactedCount, closedCount, distributorCount] =
    await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ featured: true }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.countDocuments({ status: "contacted" }),
      Inquiry.countDocuments({ status: "closed" }),
      Inquiry.countDocuments({ type: "distributor" }),
    ]);

  // --- Reach: distinct countries that actually named themselves ----------
  const countries = await Inquiry.distinct("country", { country: { $nin: [null, ""] } });

  // --- 14-day trend: bucketed in JS so it works on any MongoDB version ---
  const todayUTC = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  const windowStart = todayUTC - (TREND_DAYS - 1) * DAY_MS;

  const [recentDocs, trendDocs, topProducts, recent] = await Promise.all([
    Inquiry.find().sort({ createdAt: -1 }).limit(1).lean(),
    Inquiry.find({ createdAt: { $gte: new Date(windowStart) } }).select("createdAt").lean(),
    Inquiry.aggregate<{ _id: string; count: number }>([
      { $match: { productName: { $nin: [null, ""] } } },
      { $group: { _id: "$productName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Inquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const buckets = new Map<number, number>();
  for (const doc of trendDocs) {
    if (!doc.createdAt) continue;
    const key = Math.floor(new Date(doc.createdAt).getTime() / DAY_MS) * DAY_MS;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const trendData = Array.from({ length: TREND_DAYS }, (_, i) => {
    const dayStart = windowStart + i * DAY_MS;
    const d = new Date(dayStart);
    return {
      label: `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
      value: buckets.get(dayStart) ?? 0,
    };
  });

  const inquiriesThisWeek = trendData.reduce((sum, p) => sum + p.value, 0);
  const lastInquiryAt = recentDocs[0]?.createdAt;
  const topProductRows = topProducts.map((p) => ({ label: p._id, value: p.count }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalInquiries === 0
              ? "No inquiries yet — they will show up here as soon as the site gets its first lead."
              : `${inquiriesThisWeek} inquiry${inquiriesThisWeek === 1 ? "" : "ies"} in the last ${TREND_DAYS} days` +
                (lastInquiryAt ? ` · last one ${timeAgo(lastInquiryAt)}` : "")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + Add product
          </Link>
          <Link
            href="/admin/inquiries"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Open inquiries
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products live"
          value={totalProducts}
          icon="cube"
          accent="green"
          href="/admin/products"
          hint={`${featuredProducts} flagged featured`}
        />
        <StatCard
          label="Total inquiries"
          value={totalInquiries}
          icon="inbox"
          accent="slate"
          href="/admin/inquiries"
          hint={lastInquiryAt ? `Last ${timeAgo(lastInquiryAt)}` : "None received yet"}
        />
        <StatCard
          label="Waiting on you"
          value={newCount}
          icon="inbox"
          accent="amber"
          href="/admin/inquiries?status=new"
          hint="Status is still &ldquo;new&rdquo;"
        />
        <StatCard
          label="Distributor leads"
          value={distributorCount}
          icon="users"
          accent="blue"
          href="/admin/inquiries?type=distributor"
          hint={`From ${countries.length} countr${countries.length === 1 ? "y" : "ies"}`}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title={`Inquiries · last ${TREND_DAYS} days`}
            action={
              <span className="text-xs font-medium text-slate-400">
                {inquiriesThisWeek} total{inquiriesThisWeek > 0 ? " (UTC days)" : ""}
              </span>
            }
          >
            <DailyBarChart data={trendData} />
          </Card>
        </div>

        <Card title="By status">
          <DonutChart
            slices={[
              { label: "new", value: newCount, color: STATUS_COLORS.new },
              { label: "contacted", value: contactedCount, color: STATUS_COLORS.contacted },
              { label: "closed", value: closedCount, color: STATUS_COLORS.closed },
            ]}
          />
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card
          title="Most requested products"
          action={
            <Link href="/admin/products" className="text-xs font-semibold text-brand-700 hover:underline">
              Manage
            </Link>
          }
        >
          <BarList rows={topProductRows} />
        </Card>

        <div className="lg:col-span-2">
          <Card
            title="Latest inquiries"
            action={
              <Link href="/admin/inquiries" className="text-xs font-semibold text-brand-700 hover:underline">
                View all
              </Link>
            }
          >
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No inquiries yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((iq) => (
                  <li key={String(iq._id)}>
                    <Link
                      href="/admin/inquiries"
                      className="flex items-start gap-3 py-3 transition hover:bg-slate-50 sm:px-2"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                        {initials(iq.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-sm font-semibold text-slate-900">{iq.name}</span>
                          {iq.company && <span className="truncate text-xs text-slate-400">· {iq.company}</span>}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${
                              TYPE_BADGES[iq.type ?? "general"] ?? TYPE_BADGES.general
                            }`}
                          >
                            {iq.type ?? "general"}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500">{iq.message}</span>
                        {iq.productName && (
                          <span className="mt-0.5 block truncate text-xs text-slate-400">Re: {iq.productName}</span>
                        )}
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusPill status={iq.status ?? "new"} />
                        <span className="text-[11px] text-slate-400">{timeAgo(iq.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
