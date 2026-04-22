import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, AlertOctagon, Rocket, Bell, Users,
  BookOpen, BarChart3, Settings, ShieldCheck, ChevronsLeft, ChevronsRight, X,
} from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';
import { useAuth } from '@/store/auth';
import { can, type Permission } from '@/lib/permissions';
import { useEffect } from 'react';

type NavItem = { to: string; label: string; icon: any; badge?: string; perm?: Permission };

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidents', icon: AlertOctagon, badge: 'LIVE' },
  { to: '/deployments', label: 'Deployments', icon: Rocket },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/team', label: 'Team Workspace', icon: Users },
  { to: '/runbooks', label: 'Runbooks', icon: BookOpen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, perm: 'analytics:view' },
];

const BOTTOM_NAV: NavItem[] = [
  { to: '/audit', label: 'Audit Logs', icon: ShieldCheck, perm: 'users:manage' },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavList({
  collapsed, onItemClick,
}: { collapsed: boolean; onItemClick?: () => void }) {
  const role = useAuth((s) => s.user?.role);
  const visible = (item: NavItem) => !item.perm || can(role, item.perm);

  const renderItem = (item: NavItem, isBottom = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={onItemClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 h-10 md:h-9 text-sm transition-colors',
          isActive
            ? 'bg-brand-500/10 text-fg border border-brand-500/20 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.1)]'
            : 'text-fg-muted hover:text-fg hover:bg-bg-hover border border-transparent',
          collapsed && 'justify-center',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-brand-500')} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {!isBottom && item.badge && (
                <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/30">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overscroll-contain">
      {!collapsed && <div className="section-title px-2 mb-2 mt-1">Operations</div>}
      {NAV.filter(visible).map((item) => renderItem(item))}

      {!collapsed && <div className="section-title px-2 mb-2 mt-5">System</div>}
      {BOTTOM_NAV.filter(visible).map((item) => renderItem(item, true))}
    </nav>
  );
}

/** Desktop sidebar — fixed on the left (UNCHANGED) */
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 bg-bg-soft/80 border-r border-border transition-[width] duration-200',
        sidebarCollapsed ? 'w-[68px]' : 'w-[248px]',
      )}
    >
      <div className={cn('flex items-center h-14 px-4 border-b border-border', sidebarCollapsed && 'justify-center px-0')}>
        <Logo compact={sidebarCollapsed} />
      </div>

      <NavList collapsed={sidebarCollapsed} />

      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg px-2.5 h-8 text-xs text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors',
            sidebarCollapsed && 'justify-center',
          )}
        >
          {sidebarCollapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

/**
 * Mobile drawer — slides in from the left.
 *
 * Uses pure CSS transitions (not Framer Motion) for bulletproof reliability
 * on iOS Safari. AnimatePresence + stopPropagation + onTouchEnd combinations
 * caused close-button failures in iOS 17+. This version:
 *  - Always renders in the DOM, toggles with `translate-x` for smooth anim
 *  - No Framer Motion AnimatePresence race conditions
 *  - No onTouchEnd — standard onClick works everywhere
 *  - Scroll lock uses data attribute cleanup that can't get stuck
 */
export function MobileSidebar() {
  const { mobileNavOpen, setMobileNav } = useUI();
  const location = useLocation();
  const close = () => setMobileNav(false);

  // Auto-close on navigation (route change)
  useEffect(() => {
    setMobileNav(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll while drawer is open. Cleanup guaranteed via unmount effect.
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  // Escape key support
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNav(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileNavOpen, setMobileNav]);

  return (
    <>
      {/* Backdrop — pointer-events-none when closed so it never blocks */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          'md:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />
      {/* Drawer panel */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 bottom-0 z-[81] w-[280px] max-w-[85vw] bg-bg-soft border-r border-border flex flex-col transition-transform duration-200 ease-out',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <Logo />
          <button
            type="button"
            onClick={close}
            className="h-10 w-10 grid place-items-center rounded-md text-fg-muted active:bg-bg-hover -mr-2"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavList collapsed={false} onItemClick={close} />
      </aside>
    </>
  );
}
