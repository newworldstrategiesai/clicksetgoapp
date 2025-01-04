"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USER } from './demo';

interface AuthState {
  user: typeof DEMO_USER | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async (email: string) => {
        set({ loading: true, error: null });
        try {
          if (email === DEMO_USER.email) {
            set({ user: DEMO_USER, loading: false });
            return;
          }
          throw new Error('Only demo login is supported');
        } catch (error) {
          set({ error: error as Error, loading: false });
          throw error;
        }
      },

      signOut: () => {
        set({ user: null, error: null });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);