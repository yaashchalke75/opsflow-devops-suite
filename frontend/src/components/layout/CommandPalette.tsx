import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '@/store/ui';
import {
  Search, LayoutDashboard, AlertOctagon, Rocket, Bell, Users,
  BookOpen, BarChart3, Settings, ShieldCheck, Plus, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { can, type Permission } from '@/lib/permissions';

interface Item { id: string; label: string; hint: string; icon: React.ComponentType<any>; to?: string; action?: () => void; group: string; perm?: Permission }

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUI();
  const nav = useNavigate();
  const role = useAuth((s) => s.user?.role);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (e.key === 'Escape' && commandOpen) setCommandOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => { if (!commandOpen) setQ(''); }, [commandOpen]);

  const items: Item[] = useMemo(() => [
    { id: 'go-dash', label: 'Go to Dashboard', hint: 'Overview', icon: LayoutDashboard, to: '/dashboard', group: 'Navigate' },
    { id: 'go-inc', label: 'Go to Incidents', hint: 'All incidents', icon: AlertOctagon, to: '/incidents', group: 'Navigate' },
    { id: 'go-dep', label: 'Go to Deployments', hint: 'Release history', icon: Rocket, to: '/deployments', group: 'Navigate' },
    { id: 'go-alr', label: 'Go to Alerts', hint: 'Monitoring alerts', icon: Bell, to: '/alerts', group: 'Navigate' },
    { id: 'go-team', label: 'Go to Team Workspace', hint: 'Members & tasks', icon: Users, to: '/team', group: 'Navigate' },
    { id: 'go-rb', label: 'Go to Runbooks', hint: 'Knowledge base', icon: BookOpen, to: '/runbooks', group: 'Navigate' },
    { id: 'go-ana', label: 'Go to Analytics', hint: 'Team metrics', icon: BarChart3, to: '/analytics', group: 'Navigate', perm: 'analytics:view' },
    { id: 'go-aud', label: 'Go to Audit Logs', hint: 'Security trail', icon: ShieldCheck, to: '/audit', group: 'Navigate', perm: 'users:manage' },
    { id: 'go-set', label: 'Go to Settings', hint: 'Profile & org', icon: Settings, to: '/settings', group: 'Navigate' },
    { id: 'new-inc', label: 'Create new incident', hint: 'Open modal', icon: Plus, to: '/incidents?new=1', group: 'Actions', perm: 'incidents:manage' },
    { id: 'new-dep', label: 'Create new deployment', hint: 'Release a version', icon: Plus, to: '/deployments?new=1', group: 'Actions', perm: 'deployments:manage' },
    { id: 'new-rb', label: 'Create new runbook', hint: 'Add documentation', icon: Plus, to: '/runbooks?new=1', group: 'Actions', perm: 'runbooks:manage' },
  ], []);

  const filtered = items
    .filter((i) => !i.perm || can(role, i.perm))
    .filter((i) => i.label.toLowerCase().includes(q.toLowerCase()) || i.hint.toLowerCase().includes(q.toLowerCase()));
  const groups = filtered.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.group] ||= []).push(i); return acc;
  }, {});

  const run = (item: Item) => {
    setCommandOpen(false);
    if (item.to) nav(item.to);
    if (item.action) item.action();
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] p-4 pt-[10vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto w-full max-w-xl card p-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
              <Search className="h-4 w-4 text-fg-subtle" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="bg-transparent flex-1 text-sm outline-none placeholder:text-fg-subtle"
                placeholder="Type a command or search…"
              />
              <span className="kbd">ESC</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {Object.keys(groups).length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-fg-muted">No matches</div>
              )}
              {Object.entries(groups).map(([group, list]) => (
                <div key={group} className="py-1">
                  <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">{group}</div>
                  {list.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => run(item)}
                      className={cn('w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-bg-hover transition-colors text-left')}
                    >
                      <item.icon className="h-4 w-4 text-fg-muted" />
                      <span className="flex-1 text-fg">{item.label}</span>
                      <span className="text-xs text-fg-subtle">{item.hint}</span>
                      <ArrowRight className="h-3 w-3 text-fg-subtle" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
