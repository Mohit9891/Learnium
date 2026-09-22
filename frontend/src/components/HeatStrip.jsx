export default function HeatStrip({ days = [] }) {
  if (!days.length) return null;
  const max = Math.max(1, ...days.map((d) => d.attempted));

  return (
    <div className="flex items-end gap-1.5" role="img" aria-label="7-day activity">
      {days.map((d) => {
        const level = d.attempted === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((d.attempted / max) * 4)));
        const bg =
          level === 0
            ? 'bg-hairline-cloud/60'
            : level === 1
              ? 'bg-violet/25'
              : level === 2
                ? 'bg-violet/50'
                : level === 3
                  ? 'bg-violet/75'
                  : 'bg-violet';
        const label = new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'narrow',
        });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.attempted} attempted`}>
            <div className={`w-full rounded-xs ${bg}`} style={{ height: 12 + level * 9 }} />
            <span className="text-micro-cap font-code text-ink/40">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
