import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setMobileNav: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  mobileNavOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
}));
