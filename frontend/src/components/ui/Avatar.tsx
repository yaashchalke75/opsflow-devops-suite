import { cn } from '@/lib/utils';

interface Props {
  name: string;
  initials?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

export function Avatar({ name, initials, color = '#F43F5E', size = 'md', status }: Props) {
  const letters = (initials || name.slice(0, 2)).toUpperCase();
  return (
    <div className="relative inline-flex">
      <div
        className={cn(
          'rounded-full font-semibold text-white grid place-items-center ring-2 ring-bg-card',
          SIZE[size],
        )}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)` }}
        title={name}
      >
        {letters}
      </div>
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-bg-card',
            status === 'online' && 'bg-state-success',
            status === 'away' && 'bg-state-warning',
            status === 'offline' && 'bg-fg-subtle',
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ users, max = 4 }: { users: { name: string; initials?: string; avatarColor?: string }[]; max?: number }) {
  const visible = users.slice(0, max);
  const rest = users.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} initials={u.initials} color={u.avatarColor} size="sm" />
      ))}
      {rest > 0 && (
        <div className="h-7 w-7 rounded-full bg-bg-elev border border-border grid place-items-center text-[10px] text-fg-muted ring-2 ring-bg-card">
          +{rest}
        </div>
      )}
    </div>
  );
}
