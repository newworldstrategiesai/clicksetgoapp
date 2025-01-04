import { useAuthStore } from './store';

export function useAuth() {
  const { user, loading, error } = useAuthStore();
  return { user, loading, error };
}