import { create } from 'zustand';
import api from '../services/api.js';
import { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('nexus_access_token'),
  isLoading: true,
  theme: (localStorage.getItem('nexus_theme') as 'dark' | 'light') || 'light',

  setTheme: (theme: 'dark' | 'light') => {
    localStorage.setItem('nexus_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  login: (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('nexus_access_token', accessToken);
    localStorage.setItem('nexus_refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('nexus_refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {}
    localStorage.removeItem('nexus_access_token');
    localStorage.removeItem('nexus_refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('nexus_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('nexus_access_token');
      localStorage.removeItem('nexus_refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updatedData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null,
    }));
  },
}));
