  // context/UserContext.tsx
'use client'; // Add this line to specify that this file is a client component

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface UserContextType {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        setLoading(false);
        return;
      }
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', userError);
          setLoading(false);
          return;
        }
        if (user) {
          setUserId(user.id);
        }
      }
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ userId, setUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
  