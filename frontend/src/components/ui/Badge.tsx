import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'brand';

const TONES: Record<Tone, string> = {
  neutral: 'bg-bg-elev text-fg-muted border-border',
  success: 'bg-state-success/10 text-state-success border-state-success/30',
  warning: 'bg-state-warning/10 text-state-warning border-state-warning/30',
  danger: 'bg-state-danger/10 text-state-danger border-state-danger/30',
  info: 'bg-state-info/10 text-state-info border-state-info/30',
  critical: 'bg-state-critical/15 text-state-critical border-state-critical/40',
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
};

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('chip', TONES[tone], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse-dot',
        tone === 'success' && 'bg-state-success',
        tone === 'warning' && 'bg-state-warning',
        tone === 'danger' && 'bg-state-danger',
        tone === 'critical' && 'bg-state-critical',
        tone === 'info' && 'bg-state-info',
        tone === 'brand' && 'bg-brand-500',
        tone === 'neutral' && 'bg-fg-muted',
      )} />}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'critical' }) {
  const map: Record<string, Tone> = { low: 'neutral', medium: 'info', high: 'warning', critical: 'critical' };
  return <Badge tone={map[priority]}>{priority}</Badge>;
}

export function IncidentStatusBadge({ status }: { status: 'open' | 'investigating' | 'monitoring' | 'resolved' }) {
  const map: Record<string, Tone> = { open: 'danger', investigating: 'warning', monitoring: 'info', resolved: 'success' };
  const label: Record<string, string> = { open: 'Open', investigating: 'Investigating', monitoring: 'Monitoring', resolved: 'Resolved' };
  return <Badge tone={map[status]} dot={status !== 'resolved'}>{label[status]}</Badge>;
}

export function DeploymentStatusBadge({ status }: { status: 'success' | 'failed' | 'in_progress' | 'rolled_back' }) {
  const map: Record<string, Tone> = { success: 'success', failed: 'danger', in_progress: 'info', rolled_back: 'warning' };
  const label: Record<string, string> = { success: 'Success', failed: 'Failed', in_progress: 'In Progress', rolled_back: 'Rolled Back' };
  return <Badge tone={map[status]} dot={status === 'in_progress'}>{label[status]}</Badge>;
}

export function AlertSeverityBadge({ severity }: { severity: 'warning' | 'major' | 'critical' }) {
  const map: Record<string, Tone> = { warning: 'warning', major: 'danger', critical: 'critical' };
  return <Badge tone={map[severity]}>{severity}</Badge>;
}

export function AlertStatusBadge({ status }: { status: 'firing' | 'acknowledged' | 'muted' | 'resolved' }) {
  const map: Record<string, Tone> = { firing: 'danger', acknowledged: 'warning', muted: 'neutral', resolved: 'success' };
  return <Badge tone={map[status]} dot={status === 'firing'}>{status}</Badge>;
}
