const STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  contacted: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  closed: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        STYLES[status] ?? STYLES.closed
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "new" ? "bg-amber-500" : status === "contacted" ? "bg-blue-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}
