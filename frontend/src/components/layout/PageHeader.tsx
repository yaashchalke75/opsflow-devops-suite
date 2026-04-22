interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, meta }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5 md:mb-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight break-words">{title}</h1>
          {meta}
        </div>
        {subtitle && <p className="text-xs md:text-sm text-fg-muted mt-1 break-words">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">{action}</div>}
    </div>
  );
}
