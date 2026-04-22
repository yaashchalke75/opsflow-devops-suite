import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card p-5', className)} {...rest} />;
}

export function CardHeader({ title, subtitle, action, className }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {subtitle && <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
