import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { useState, useRef, useEffect } from 'react';
import { ROLE_LABEL } from '@/lib/permissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

export function Topbar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, clear } = useAuth();
  const { setCommandOpen, setMobileNav } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
  });
  const unread = notifications.filter((n) => !n.read).length;

  const markAllMut = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const markOneMut = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const openNotification = (n: Notification) => {
    setNotifOpen(false);
    if (!n.read) markOneMut.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  const onLogout = () => { clear(); navigate('/login'); };

  return (
    <header className="sticky md:relative top-0 z-50 h-14 border-b border-border bg-bg-soft/95 md:bg-bg-soft/60 backdrop-blur-sm flex items-center justify-between gap-2 px-3 md:px-6 shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={() => setMobileNav(true)}
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg border border-border bg-bg-soft text-fg-muted hover:text-fg shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2.5 h-9 px-3.5 rounded-lg border border-border bg-bg-soft/80 text-sm text-fg-muted hover:text-fg hover:border-border-strong transition flex-1 max-w-[520px] min-w-0"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search…</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-xs text-fg-muted mr-2">
          <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse-dot" />
          All systems operational
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative h-9 w-9 grid place-items-center rounded-lg border border-border bg-bg-soft hover:bg-bg-hover text-fg-muted hover:text-fg"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 rounded-full bg-brand-500 text-white text-[9px] font-semibold grid place-items-center">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-[56px] sm:top-11 w-[calc(100vw-1rem)] sm:w-[360px] max-w-[360px] bg-bg-card border border-border rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] p-0 z-[60] animate-fade-in backdrop-blur-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="text-sm font-semibold">
                  Notifications
                  {unread > 0 && (
                    <span className="ml-2 text-[10px] font-medium text-brand-400">{unread} new</span>
                  )}
                </div>
                <button
                  onClick={() => markAllMut.mutate()}
                  disabled={unread === 0 || markAllMut.isPending}
                  className="text-xs text-fg-muted hover:text-fg disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-6 text-xs text-fg-muted text-center">No notifications</div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-bg-hover/60 transition-colors',
                      !n.read && 'bg-brand-500/5',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read
                        ? <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        : <span className="h-1.5 w-1.5 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-fg">{n.title}</div>
                        <div className="text-xs text-fg-muted truncate">{n.body}</div>
                        <div className="text-[10px] text-fg-subtle mt-1">{formatRelative(n.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-lg border border-border bg-bg-soft hover:border-border-strong transition"
          >
            <Avatar
              name={user?.name || 'U'}
              initials={user?.initials}
              color={user?.avatarColor}
              size="sm"
              status={user?.status}
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-fg leading-tight">{user?.name || 'Guest'}</div>
              <div className="text-[10px] text-fg-subtle leading-tight">
                {user?.role ? ROLE_LABEL[user.role] : ''}
              </div>
            </div>
          </button>
          {menuOpen && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-[56px] sm:top-11 w-56 bg-bg-card border border-border rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] p-1 z-[60] animate-fade-in backdrop-blur-sm">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-xs font-medium truncate">{user?.email}</div>
                <div className="text-[10px] text-fg-subtle">{user?.role && ROLE_LABEL[user.role]}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full text-left px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-bg-hover rounded-md transition-colors"
              >
                Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm text-state-danger hover:bg-state-danger/10 rounded-md flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
