// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
      // Only persist user + token, not the actions
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
