import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi, teamApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select, Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, PriorityBadge, IncidentStatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, AlertOctagon, MessageSquare, Send, X } from 'lucide-react';
import { formatRelative, formatDate } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useCan } from '@/hooks/useCan';
import { ReadOnlyBanner } from '@/components/ui/ReadOnlyBanner';
import toast from 'react-hot-toast';
import type { Incident, IncidentPriority, IncidentStatus } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

export default function Incidents() {
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const canManage = useCan('incidents:manage');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', q, status, priority],
    queryFn: () => incidentApi.list({ q, status, priority }),
  });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: teamApi.listUsers });

  const counts = useMemo(() => ({
    open: incidents.filter((i) => i.status === 'open').length,
    investigating: incidents.filter((i) => i.status === 'investigating').length,
    monitoring: incidents.filter((i) => i.status === 'monitoring').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  }), [incidents]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['incidents'] });

  const createMut = useMutation({
    mutationFn: incidentApi.create,
    onSuccess: () => { toast.success('Incident created'); setCreateOpen(false); invalidate(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Incident> }) =>
      incidentApi.update(id, patch),
    onSuccess: (row) => { invalidate(); setSelected(row); },
  });

  const commentMut = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) =>
      incidentApi.comment(id, msg, user!),
    onSuccess: () => {
      if (selected) incidentApi.get(selected.id).then(setSelected);
      invalidate();
    },
  });

  return (
    <div>
      <PageHeader
        title="Incidents"
        subtitle="Coordinate triage, ownership, and resolution in one place."
        action={
          canManage ? (
            <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateOpen(true)}>
              New incident
            </Button>
          ) : null
        }
      />
      <ReadOnlyBanner />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by key or title…" className="md:w-[320px]" />
        <div className="flex gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[160px]">
            <option value="all">All statuses</option>
            <option value="open">Open ({counts.open})</option>
            <option value="investigating">Investigating ({counts.investigating})</option>
            <option value="monitoring">Monitoring ({counts.monitoring})</option>
            <option value="resolved">Resolved ({counts.resolved})</option>
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-[140px]">
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={<AlertOctagon className="h-5 w-5" />}
          title="No incidents match"
          description="Try clearing filters, or create a new incident when something breaks."
          action={canManage ? <Button onClick={() => setCreateOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>New incident</Button> : null}
        />
      ) : (
        <Table>
          <THead>
            <TH>Key</TH>
            <TH>Title</TH>
            <TH>Priority</TH>
            <TH>Status</TH>
            <TH>Owner</TH>
            <TH>Service</TH>
            <TH className="text-right">Updated</TH>
          </THead>
          <TBody>
            {incidents.map((row) => (
              <TR key={row.id} onClick={() => setSelected(row)}>
                <TD><span className="font-mono text-xs text-fg-muted">{row.key}</span></TD>
                <TD className="max-w-[360px]">
                  <div className="font-medium truncate">{row.title}</div>
                  <div className="text-xs text-fg-subtle flex gap-1.5 mt-0.5">
                    {row.tags.map((t) => <span key={t} className="chip bg-bg-elev border-border text-fg-muted">{t}</span>)}
                  </div>
                </TD>
                <TD><PriorityBadge priority={row.priority} /></TD>
                <TD><IncidentStatusBadge status={row.status} /></TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <Avatar name={row.ownerName} size="sm" />
                    <span className="text-xs">{row.ownerName}</span>
                  </div>
                </TD>
                <TD><span className="text-xs font-mono text-fg-muted">{row.service}</span></TD>
                <TD className="text-right text-xs text-fg-muted">{formatRelative(row.updatedAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Report new incident"
        description="Give your team the context they need to start triage."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button form="new-inc-form" type="submit" loading={createMut.isPending}>Create incident</Button>
          </>
        }
      >
        <form
          id="new-inc-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: String(fd.get('title')),
              description: String(fd.get('description')),
              priority: fd.get('priority') as IncidentPriority,
              service: String(fd.get('service')),
              ownerId: String(fd.get('ownerId')),
              tags: String(fd.get('tags')).split(',').map((s) => s.trim()).filter(Boolean),
            });
          }}
          className="space-y-4"
        >
          <Input name="title" label="Title" required placeholder="Brief, descriptive summary" />
          <Textarea name="description" label="Description" required placeholder="What is affected? What do we know so far?" />
          <div className="grid grid-cols-2 gap-3">
            <Select name="priority" label="Priority" required defaultValue="high">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Input name="service" label="Service" required placeholder="api-gateway" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select name="ownerId" label="Owner" required>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Input name="tags" label="Tags" placeholder="Comma separated" />
          </div>
        </form>
      </Modal>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[560px] bg-bg-card border-l border-border flex flex-col"
            >
              <div className="flex items-start justify-between px-4 md:px-5 py-3.5 md:py-4 border-b border-border shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-fg-muted mb-1 flex-wrap">
                    <span className="font-mono">{selected.key}</span>
                    <span>·</span>
                    <span>{formatDate(selected.createdAt)}</span>
                  </div>
                  <h2 className="text-base font-semibold pr-2 break-words">{selected.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-9 w-9 grid place-items-center text-fg-subtle hover:text-fg active:bg-bg-hover rounded-md shrink-0 -mr-1"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 md:p-5 border-b border-border grid grid-cols-2 gap-3 md:gap-4 text-sm">
                <div>
                  <div className="label">Priority</div>
                  <Select
                    value={selected.priority}
                    disabled={!canManage}
                    onChange={(e) => updateMut.mutate({ id: selected.id, patch: { priority: e.target.value as IncidentPriority } })}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </div>
                <div>
                  <div className="label">Status</div>
                  <Select
                    value={selected.status}
                    disabled={!canManage}
                    onChange={(e) => updateMut.mutate({ id: selected.id, patch: { status: e.target.value as IncidentStatus } })}
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                </div>
                <div>
                  <div className="label">Owner</div>
                  <div className="flex items-center gap-2">
                    <Avatar name={selected.ownerName} size="sm" />
                    <span className="text-sm">{selected.ownerName}</span>
                  </div>
                </div>
                <div>
                  <div className="label">Service</div>
                  <Badge tone="neutral">{selected.service}</Badge>
                </div>
              </div>

              <div className="p-5 border-b border-border">
                <div className="label">Description</div>
                <p className="text-sm text-fg-muted whitespace-pre-wrap">{selected.description}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <MessageSquare className="h-3.5 w-3.5 text-fg-muted" />
                  Timeline · {selected.comments.length}
                </div>
                <div className="space-y-3">
                  {selected.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar name={c.authorName} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{c.authorName}</span>
                          <span className="text-fg-subtle">{formatRelative(c.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-sm text-fg bg-bg-soft border border-border rounded-lg px-3 py-2">
                          {c.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {canManage ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const msg = String(fd.get('msg')).trim();
                    if (!msg) return;
                    commentMut.mutate({ id: selected.id, msg });
                    e.currentTarget.reset();
                  }}
                  className="p-3 border-t border-border flex items-center gap-2"
                >
                  <input name="msg" className="input h-9" placeholder="Post an update…" />
                  <Button type="submit" size="sm" icon={<Send className="h-3 w-3" />} loading={commentMut.isPending}>Send</Button>
                </form>
              ) : (
                <div className="p-3 border-t border-border text-xs text-fg-subtle text-center">
                  Read-only access — contact an admin to comment or update incidents.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
