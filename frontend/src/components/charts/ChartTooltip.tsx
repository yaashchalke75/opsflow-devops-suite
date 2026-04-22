import type { TooltipProps } from 'recharts';

/**
 * Dark, high-contrast tooltip for all Recharts charts.
 * Default Recharts styling renders label/value text near-black,
 * which disappears on our dark theme.
 */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-card/95 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] px-3 py-2 text-xs min-w-[140px]">
      {label && (
        <div className="text-fg font-semibold mb-1.5 pb-1.5 border-b border-border">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-fg-muted">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: entry.color || entry.payload?.fill }}
              />
              <span className="capitalize">{entry.name}</span>
            </span>
            <span className="text-fg font-semibold tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
