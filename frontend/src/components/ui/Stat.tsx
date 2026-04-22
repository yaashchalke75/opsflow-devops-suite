import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stat({
  label,
  value,
  delta,
  icon,
  accent = 'brand',
}: {
  label: string;
  value: string | number;
  delta?: number; // percent
  icon?: React.ReactNode;
  accent?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const positive = (delta ?? 0) >= 0;
  const accentCls =
    accent === 'brand' ? 'text-brand-500 bg-brand-500/10'
    : accent === 'success' ? 'text-state-success bg-state-success/10'
    : accent === 'warning' ? 'text-state-warning bg-state-warning/10'
    : accent === 'danger' ? 'text-state-danger bg-state-danger/10'
    : 'text-state-info bg-state-info/10';
  return (
    <div className="card p-3.5 md:p-5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-xs text-fg-muted font-medium truncate">{label}</p>
          <p className="text-xl md:text-2xl font-semibold mt-1.5 md:mt-2 tracking-tight">{value}</p>
        </div>
        <div className={cn('h-8 w-8 md:h-9 md:w-9 rounded-lg grid place-items-center shrink-0', accentCls)}>{icon}</div>
      </div>
      {typeof delta === 'number' && (
        <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 text-xs flex-wrap">
          <span className={cn('inline-flex items-center gap-0.5 font-medium',
            positive ? 'text-state-success' : 'text-state-danger')}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-fg-subtle text-[10px] md:text-xs">vs last week</span>
        </div>
      )}
    </div>
  );
}
