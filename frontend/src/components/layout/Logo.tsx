export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-glow">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M9 20 L16 8 L23 20 L19 20 L16 15 L13 20 Z" fill="white" />
            <circle cx="16" cy="23" r="1.6" fill="white" />
          </svg>
        </div>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">OpsFlow</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-fg-subtle">DevOps Platform</div>
        </div>
      )}
    </div>
  );
}
