type Point = { label: string; value: number };

/** Server-rendered SVG bar chart for daily counts. Native <title> tooltips. */
export default function DailyBarChart({ data }: { data: Point[] }) {
  const W = 560;
  const H = 220;
  const padL = 26;
  const padR = 8;
  const padT = 16;
  const padB = 26;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = iw / Math.max(1, data.length);
  const bw = Math.min(28, step * 0.55);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const skip = data.length > 8 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Inquiries per day, last 14 days">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d8f66" />
          <stop offset="1" stopColor="#8ecaa9" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => {
        const y = padT + ih - g * ih;
        return (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
              {Math.round(max * g)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const h = (d.value / max) * ih;
        const x = padL + i * step + (step - bw) / 2;
        const y = padT + ih - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={Math.max(h, d.value > 0 ? 3 : 1)} rx={3} fill={d.value > 0 ? "url(#bar-grad)" : "#e2e8f0"}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {i % skip === 0 && (
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
