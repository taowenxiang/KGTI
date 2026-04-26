import { create } from 'zustand';
import type { User } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storedToken,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
