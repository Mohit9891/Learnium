export default function ScoreRing({ value = 0, size = 120, stroke = 12 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = pct >= 90;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${pct} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-hairline-cloud" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className={done ? 'stroke-lime' : 'stroke-violet'}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-center">
        <span className="block font-display font-bold text-ink-deep" style={{ fontSize: size * 0.24 }}>
          {pct}
        </span>
        <span className="block font-code text-ink/50" style={{ fontSize: size * 0.1 }}>
          / 100
        </span>
      </span>
    </div>
  );
}
