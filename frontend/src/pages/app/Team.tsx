import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Users } from 'lucide-react';
import { ROLE_LABEL } from '@/lib/permissions';
import { formatRelative } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Role, TaskStatus, TaskPriority } from '@/types';
import { useCan } from '@/hooks/useCan';
import { ReadOnlyBanner } from '@/components/ui/ReadOnlyBanner';

const STATUS_TABS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export default function Team() {
  const qc = useQueryClient();
  const canManageUsers = useCan('users:manage');
  const canCreateTask = useCan('incidents:manage'); // tasks are ops coordination
  const [tab, setTab] = useState<TaskStatus | 'all'>('all');
  const [newOpen, setNewOpen] = useState(false);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: teamApi.listUsers });
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: teamApi.listTeams });
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: teamApi.listTasks });

  const filtered = tab === 'all' ? tasks : tasks.filter((t) => t.status === tab);

  const createMut = useMutation({
    mutationFn: teamApi.createTask,
    onSuccess: () => { toast.success('Task created'); setNewOpen(false); qc.invalidateQueries({ queryKey: ['tasks'] }); },
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => teamApi.updateUser(id, { role }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => teamApi.updateTask(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div>
      <PageHeader
        title="Team Workspace"
        subtitle="Members, roles, and task coordination."
        action={canCreateTask ? <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setNewOpen(true)}>New task</Button> : null}
      />
      <ReadOnlyBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Teams" subtitle={`${teams.length} active · ${users.length} members`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((t) => (
              <div key={t.id} className="rounded-lg border border-border bg-bg-soft p-4 hover:border-border-strong transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md grid place-items-center text-white text-xs font-bold" style={{ background: t.color }}>
                      {t.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-fg-muted">{t.description}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <AvatarGroup users={users.filter((u) => u.team === t.name).slice(0, 4)} />
                  <Badge tone="neutral">{t.memberCount} members</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Online now" />
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {users.filter((u) => u.status === 'online').map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-hover">
                <Avatar name={u.name} initials={u.initials} color={u.avatarColor} status={u.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{u.name}</div>
                  <div className="text-xs text-fg-muted truncate">{u.title}</div>
                </div>
                <Badge tone="brand">{ROLE_LABEL[u.role]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Members" subtitle="Manage roles and permissions" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft/60 border-y border-border text-left text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Member</th>
                <th className="px-5 py-2.5 font-semibold">Title</th>
                <th className="px-5 py-2.5 font-semibold">Team</th>
                <th className="px-5 py-2.5 font-semibold">Role</th>
                <th className="px-5 py-2.5 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-bg-hover/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} initials={u.initials} color={u.avatarColor} size="sm" status={u.status} />
                      <div>
                        <div className="text-sm">{u.name}</div>
                        <div className="text-xs text-fg-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm">{u.title}</td>
                  <td className="px-5 py-3"><Badge tone="neutral">{u.team}</Badge></td>
                  <td className="px-5 py-3">
                    {canManageUsers ? (
                      <select
                        value={u.role}
                        onChange={(e) => updateRoleMut.mutate({ id: u.id, role: e.target.value as Role })}
                        className="input h-8 py-0 text-xs w-[160px]"
                      >
                        {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <Badge tone="brand">{ROLE_LABEL[u.role]}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-fg-muted">{formatRelative(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold">Tasks</h2>
        <Tabs<TaskStatus | 'all'>
          tabs={STATUS_TABS.map((t) => ({ ...t, count: t.value === 'all' ? tasks.length : tasks.filter((x) => x.status === t.value).length }))}
          value={tab}
          onChange={setTab}
        />
      </div>
      {isLoading ? <Skeleton className="h-40 mt-3" /> : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((t) => (
            <div key={t.id} className="card p-4 hover:border-border-strong transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-fg-muted mt-1">Assigned to {t.assigneeName}</div>
                </div>
                <Badge tone={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'neutral'}>{t.priority}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {canCreateTask ? (
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskMut.mutate({ id: t.id, status: e.target.value as TaskStatus })}
                    className="input h-8 py-0 text-xs w-[140px]"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <Badge tone="neutral">{t.status.replace('_', ' ')}</Badge>
                )}
                {t.dueAt && <span className="text-xs text-fg-muted">Due {formatRelative(t.dueAt)}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 text-center py-12 text-xs text-fg-muted">
              <Users className="h-5 w-5 mx-auto mb-2" />
              No tasks in this view
            </div>
          )}
        </div>
      )}

      <Modal
        open={newOpen} onClose={() => setNewOpen(false)} title="New task" size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
          <Button form="new-task" type="submit" loading={createMut.isPending}>Create</Button>
        </>}
      >
        <form
          id="new-task"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: String(fd.get('title')),
              assigneeId: String(fd.get('assigneeId')),
              priority: fd.get('priority') as TaskPriority,
            });
          }}
          className="space-y-4"
        >
          <Input name="title" label="Title" required placeholder="Short, actionable summary" />
          <div className="grid grid-cols-2 gap-3">
            <Select name="assigneeId" label="Assignee" required>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Select name="priority" label="Priority" defaultValue="medium">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
