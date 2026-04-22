import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  isDemo: boolean;
  setSession: (user: User, token: string, opts?: { demo?: boolean }) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  isDemo: false,
  setSession: (user, token, opts) => {
    localStorage.setItem('opsflow_user', JSON.stringify(user));
    localStorage.setItem('opsflow_token', token);
    localStorage.setItem('opsflow_demo', opts?.demo ? '1' : '0');
    set({ user, token, isDemo: !!opts?.demo });
  },
  clear: () => {
    localStorage.removeItem('opsflow_user');
    localStorage.removeItem('opsflow_token');
    localStorage.removeItem('opsflow_demo');
    set({ user: null, token: null, isDemo: false });
  },
  hydrate: () => {
    const token = localStorage.getItem('opsflow_token');
    const userRaw = localStorage.getItem('opsflow_user');
    const isDemo = localStorage.getItem('opsflow_demo') === '1';
    if (token && userRaw) {
      try { set({ user: JSON.parse(userRaw), token, isDemo, hydrated: true }); return; }
      catch { /* ignore */ }
    }
    set({ hydrated: true });
  },
}));
