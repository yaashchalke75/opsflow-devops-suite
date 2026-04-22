interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, meta }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {meta}
        </div>
        {subtitle && <p className="text-sm text-fg-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap">{action}</div>}
    </div>
  );
}
