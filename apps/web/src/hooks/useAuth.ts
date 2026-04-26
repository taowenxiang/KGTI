import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import type { User } from '@shared/types';

export function useAuth() {
  const { user, token, isLoading, setUser, setToken, logout, setLoading } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return { user, isLoading, isAuthenticated: !!user, logout };
}
