'use client';

import { create } from 'zustand';

// Sidebar store
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
}));

// Auth store
export interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialhub_user', JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('socialhub_user');
    }
    set({ user: null });
  },
  loadUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('socialhub_user');
      if (stored) {
        try {
          set({ user: JSON.parse(stored) });
        } catch {
          localStorage.removeItem('socialhub_user');
        }
      }
    }
  },
}));
