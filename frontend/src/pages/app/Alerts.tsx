import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { AlertSeverityBadge, AlertStatusBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BellOff, CheckCircle2, VolumeX, Bell } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Alert } from '@/types';
import { useCan } from '@/hooks/useCan';
import { ReadOnlyBanner } from '@/components/ui/ReadOnlyBanner';

export default function Alerts() {
  const qc = useQueryClient();
  const canManage = useCan('alerts:manage');
  const [q, setQ] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', q, severity, status],
    queryFn: () => alertApi.list({ q, severity, status }),
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Alert['status'] }) => alertApi.setStatus(id, status),
    onSuccess: (_d, v) => { toast.success(`Alert ${v.status}`); qc.invalidateQueries({ queryKey: ['alerts'] }); },
  });

  return (
    <div>
      <PageHeader
        title="Alerts Center"
        subtitle="Infrastructure signals from Datadog, Prometheus, Sentry, and more."
        meta={<Badge tone="danger" dot>{alerts.filter((a) => a.status === 'firing').length} firing</Badge>}
      />
      <ReadOnlyBanner />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alert titles…" className="md:w-[320px]" />
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-[160px]">
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="major">Major</option>
          <option value="warning">Warning</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[160px]">
          <option value="all">All statuses</option>
          <option value="firing">Firing</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="muted">Muted</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      {isLoading ? <Skeleton className="h-[400px]" />
        : alerts.length === 0 ? (
          <EmptyState icon={<Bell className="h-5 w-5" />} title="No alerts" description="You'll see monitoring alerts from your integrations here." />
        ) : (
          <Table>
            <THead>
              <TH>Alert</TH>
              <TH>Source</TH>
              <TH>Severity</TH>
              <TH>Status</TH>
              <TH>Resource</TH>
              <TH>Value</TH>
              <TH className="text-right">Triggered</TH>
              <TH></TH>
            </THead>
            <TBody>
              {alerts.map((a) => (
                <TR key={a.id}>
                  <TD className="max-w-[320px]">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-xs text-fg-muted truncate">{a.message}</div>
                  </TD>
                  <TD><Badge tone="neutral">{a.source}</Badge></TD>
                  <TD><AlertSeverityBadge severity={a.severity} /></TD>
                  <TD><AlertStatusBadge status={a.status} /></TD>
                  <TD className="text-xs font-mono text-fg-muted">{a.resource}</TD>
                  <TD className="text-xs font-mono">{a.metricValue}</TD>
                  <TD className="text-right text-xs text-fg-muted">{formatRelative(a.createdAt)}</TD>
                  <TD>
                    {canManage ? (
                      <div className="flex items-center justify-end gap-1">
                        {a.status === 'firing' && (
                          <>
                            <Button size="sm" variant="ghost" icon={<CheckCircle2 className="h-3 w-3" />} onClick={() => setStatusMut.mutate({ id: a.id, status: 'acknowledged' })}>Ack</Button>
                            <Button size="sm" variant="ghost" icon={<VolumeX className="h-3 w-3" />} onClick={() => setStatusMut.mutate({ id: a.id, status: 'muted' })}>Mute</Button>
                          </>
                        )}
                        {a.status !== 'resolved' && (
                          <Button size="sm" variant="ghost" icon={<BellOff className="h-3 w-3" />} onClick={() => setStatusMut.mutate({ id: a.id, status: 'resolved' })}>Resolve</Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-fg-subtle">read-only</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
    </div>
  );
}
