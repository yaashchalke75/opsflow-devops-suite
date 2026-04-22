import { Inbox } from 'lucide-react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto h-12 w-12 rounded-xl bg-bg-elev border border-border grid place-items-center text-fg-muted mb-4">
        {icon || <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description && <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
