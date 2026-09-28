import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  cube: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25M21 7.5v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  ),
  tag: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.567 3z" />
  ),
  inbox: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177c-.066.214-.1.437-.1.661z" />
  ),
  users: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.86 0-1.11.464-2.14 1.266-2.893A12.32 12.32 0 0111 12.5c2.193 0 4.174.853 5.65 2.245M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
  ),
};

const ACCENTS: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-brand-50", text: "text-brand-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
};

export default function StatCard({
  label,
  value,
  icon,
  accent = "green",
  href,
  hint,
}: {
  label: string;
  value: number | string;
  icon: keyof typeof ICONS;
  accent?: keyof typeof ACCENTS;
  href?: string;
  hint?: string;
}) {
  const a = ACCENTS[accent] ?? ACCENTS.green;
  const body = (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          {ICONS[icon]}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold leading-tight text-slate-900">{value}</span>
        <span className="block truncate text-sm font-medium text-slate-500">{label}</span>
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </span>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
