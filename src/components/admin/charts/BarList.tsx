type Row = { label: string; value: number; color?: string };

/** Server-rendered horizontal bar list. */
export default function BarList({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No data yet.</p>;
  }

  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-slate-700">{r.label}</span>
            <span className="font-semibold text-slate-900">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color ?? "#2d7352" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
