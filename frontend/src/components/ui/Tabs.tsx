import { cn } from '@/lib/utils';

export function Tabs<T extends string>({
  tabs, value, onChange, className,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-bg-soft border border-border rounded-lg', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative px-3 h-7 rounded-md text-xs font-medium transition-colors',
              active ? 'bg-bg-elev text-fg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' : 'text-fg-muted hover:text-fg',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={cn(
                'ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full text-[10px] font-semibold',
                active ? 'bg-brand-500/20 text-brand-400' : 'bg-bg-hover text-fg-muted',
              )}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
