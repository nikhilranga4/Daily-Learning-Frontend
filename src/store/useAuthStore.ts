import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      fetchUserProfile: async () => {
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('No token available');
          }

          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await api.get('/api/auth/profile');
          const userData = response.data.user;

          set({ user: userData });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          set({ user: null, token: null });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);