import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABEL } from '@/lib/permissions';

/**
 * Thin banner shown on every app page while the user is in demo mode.
 * Makes it obvious this is a shared sandbox, not production.
 */
export function DemoBanner() {
  const { isDemo, user, clear } = useAuth();
  const nav = useNavigate();
  if (!isDemo || !user) return null;

  const exit = () => { clear(); nav('/login'); };

  return (
    <div className="relative z-40 flex items-center justify-center gap-3 px-4 py-1.5 text-[11px] bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-brand-500/20 border-b border-brand-500/30 text-fg">
      <Sparkles className="h-3 w-3 text-brand-400 shrink-0" />
      <span className="text-fg-muted">
        You're in <span className="text-brand-400 font-semibold">Demo Mode</span> as{' '}
        <span className="text-fg font-medium">{user.name}</span>
        <span className="text-fg-subtle"> · {ROLE_LABEL[user.role]} · seeded users are read-protected</span>
      </span>
      <button
        onClick={exit}
        className="inline-flex items-center gap-1 text-fg-muted hover:text-fg ml-2 pl-2 border-l border-brand-500/30"
      >
        <LogOut className="h-3 w-3" /> Exit demo
      </button>
    </div>
  );
}
