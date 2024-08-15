// hooks/useSupabaseAuth.ts
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient"; // Adjust the path if necessary

export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchSession();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    // Cleanup on unmount
    return () => {
      authListener?.subscription?.unsubscribe(); // Correct way to unsubscribe
    };
  }, []);

  return { user };
}
