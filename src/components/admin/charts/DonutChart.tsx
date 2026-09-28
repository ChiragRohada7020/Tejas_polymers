type Slice = { label: string; value: number; color: string };

/** Server-rendered SVG donut with HTML legend. */
export default function DonutChart({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 70;
  const C = 2 * Math.PI * R;

  let cumulative = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Inquiries by status">
        {total === 0 ? (
          <>
            <circle cx="90" cy="90" r={R} fill="none" stroke="#e2e8f0" strokeWidth="18" />
            <text x="90" y="94" textAnchor="middle" fontSize="13" fill="#94a3b8">
              No data yet
            </text>
          </>
        ) : (
          <>
            <circle cx="90" cy="90" r={R} fill="none" stroke="#f1f5f9" strokeWidth="18" />
            {slices
              .filter((s) => s.value > 0)
              .map((s) => {
                const frac = s.value / total;
                const dash = `${frac * C} ${C}`;
                const offset = -cumulative * C;
                cumulative += frac;
                return (
                  <circle
                    key={s.label}
                    cx="90"
                    cy="90"
                    r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="18"
                    strokeDasharray={dash}
                    strokeDashoffset={offset}
                    transform="rotate(-90 90 90)"
                  >
                    <title>{`${s.label}: ${s.value} (${Math.round(frac * 100)}%)`}</title>
                  </circle>
                );
              })}
            <text x="90" y="86" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">
              {total}
            </text>
            <text x="90" y="106" textAnchor="middle" fontSize="10" fill="#94a3b8">
              TOTAL
            </text>
          </>
        )}
      </svg>

      <ul className="min-w-36 flex-1 space-y-2.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-slate-600">{s.label}</span>
            <span className="font-semibold text-slate-900">{s.value}</span>
            <span className="w-10 text-right text-xs text-slate-400">
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
