import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deploymentApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select, Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeploymentStatusBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Rocket, Undo2, GitCommit } from 'lucide-react';
import { formatRelative, formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Environment } from '@/types';
import { useCan } from '@/hooks/useCan';
import { ReadOnlyBanner } from '@/components/ui/ReadOnlyBanner';

export default function Deployments() {
  const qc = useQueryClient();
  const canManage = useCan('deployments:manage');
  const [q, setQ] = useState('');
  const [env, setEnv] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', q, env, statusFilter],
    queryFn: () => deploymentApi.list({ q, env, status: statusFilter }),
  });

  const createMut = useMutation({
    mutationFn: deploymentApi.create,
    onSuccess: () => { toast.success('Deployment triggered'); setOpen(false); qc.invalidateQueries({ queryKey: ['deployments'] }); },
  });

  const rollbackMut = useMutation({
    mutationFn: deploymentApi.rollback,
    onSuccess: () => { toast.success('Rollback executed'); qc.invalidateQueries({ queryKey: ['deployments'] }); },
  });

  const selected = deployments.find((d) => d.id === logId);

  const success = deployments.filter((d) => d.status === 'success').length;
  const failed = deployments.filter((d) => d.status === 'failed').length;
  const inProgress = deployments.filter((d) => d.status === 'in_progress').length;
  const rate = deployments.length ? Math.round((success / deployments.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Deployment Center"
        subtitle="Track every release across environments with rollback control."
        action={canManage ? <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>New deployment</Button> : null}
      />
      <ReadOnlyBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card><div className="text-xs text-fg-muted">Success rate</div><div className="text-2xl font-semibold mt-1.5">{rate}%</div></Card>
        <Card><div className="text-xs text-fg-muted">In progress</div><div className="text-2xl font-semibold mt-1.5">{inProgress}</div></Card>
        <Card><div className="text-xs text-fg-muted">Failed</div><div className="text-2xl font-semibold mt-1.5 text-state-danger">{failed}</div></Card>
        <Card><div className="text-xs text-fg-muted">Total releases</div><div className="text-2xl font-semibold mt-1.5">{deployments.length}</div></Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search version or service…" className="md:w-[320px]" />
        <Select value={env} onChange={(e) => setEnv(e.target.value)} className="w-[160px]">
          <option value="all">All environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="dev">Development</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[160px]">
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="in_progress">In progress</option>
          <option value="rolled_back">Rolled back</option>
        </Select>
      </div>

      {isLoading ? <Skeleton className="h-[400px]" />
        : deployments.length === 0 ? (
          <EmptyState icon={<Rocket className="h-5 w-5" />} title="No deployments yet" description="Ship a release to see it tracked here." />
        ) : (
          <Table>
            <THead>
              <TH>Version</TH>
              <TH>Service</TH>
              <TH>Environment</TH>
              <TH>Status</TH>
              <TH>Triggered by</TH>
              <TH>Duration</TH>
              <TH className="text-right">Time</TH>
              <TH></TH>
            </THead>
            <TBody>
              {deployments.map((d) => (
                <TR key={d.id} onClick={() => setLogId(d.id)}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{d.version}</span>
                      <span className="text-[10px] font-mono text-fg-subtle flex items-center gap-0.5">
                        <GitCommit className="h-3 w-3" /> {d.commitSha}
                      </span>
                    </div>
                    <div className="text-xs text-fg-muted truncate max-w-[260px]">{d.commitMessage}</div>
                  </TD>
                  <TD><span className="text-xs font-mono text-fg-muted">{d.service}</span></TD>
                  <TD>
                    <Badge tone={d.environment === 'production' ? 'brand' : d.environment === 'staging' ? 'warning' : 'neutral'}>
                      {d.environment}
                    </Badge>
                  </TD>
                  <TD><DeploymentStatusBadge status={d.status} /></TD>
                  <TD className="text-xs">{d.triggeredBy}</TD>
                  <TD className="text-xs text-fg-muted">{formatDuration(d.durationSec)}</TD>
                  <TD className="text-right text-xs text-fg-muted">{formatRelative(d.createdAt)}</TD>
                  <TD>
                    {canManage && d.environment === 'production' && d.status === 'success' && (
                      <Button
                        variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); rollbackMut.mutate(d.id); }}
                        icon={<Undo2 className="h-3 w-3" />}
                      >
                        Rollback
                      </Button>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

      {/* Create */}
      <Modal
        open={open} onClose={() => setOpen(false)} title="Trigger new deployment"
        description="Select an environment and provide release details." size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button form="new-dep-form" type="submit" loading={createMut.isPending} icon={<Rocket className="h-3.5 w-3.5" />}>Deploy</Button>
        </>}
      >
        <form
          id="new-dep-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              service: String(fd.get('service')),
              version: String(fd.get('version')),
              environment: fd.get('environment') as Environment,
              commitMessage: String(fd.get('commitMessage')),
              releaseNotes: String(fd.get('releaseNotes')),
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input name="service" label="Service" required defaultValue="api-gateway" />
            <Input name="version" label="Version" required defaultValue="v2.15.0" />
          </div>
          <Select name="environment" label="Environment" required defaultValue="staging">
            <option value="dev">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </Select>
          <Input name="commitMessage" label="Commit message" required placeholder="feat: faster retries" />
          <Textarea name="releaseNotes" label="Release notes" placeholder="• Bug fixes&#10;• Observability improvements" />
        </form>
      </Modal>

      {/* Logs drawer */}
      <Modal
        open={!!selected} onClose={() => setLogId(null)}
        title={selected ? `${selected.service} · ${selected.version}` : ''}
        description={selected ? selected.commitMessage : ''}
        size="lg"
      >
        {selected && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <DeploymentStatusBadge status={selected.status} />
              <Badge tone={selected.environment === 'production' ? 'brand' : 'warning'}>{selected.environment}</Badge>
              <Badge tone="neutral">{formatDuration(selected.durationSec)}</Badge>
              <Badge tone="neutral">
                <GitCommit className="h-3 w-3 mr-1" /> {selected.commitSha}
              </Badge>
            </div>

            {selected.releaseNotes && (
              <Card className="mb-4">
                <CardHeader title="Release notes" />
                <pre className="text-xs text-fg-muted whitespace-pre-wrap font-mono leading-6">{selected.releaseNotes}</pre>
              </Card>
            )}

            <Card>
              <CardHeader title="Deployment logs" />
              <div className="bg-black/50 border border-border rounded-lg p-3 font-mono text-xs leading-6 max-h-[320px] overflow-y-auto">
                {selected.logs?.map((l, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-fg-subtle shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-fg-muted">{l}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
