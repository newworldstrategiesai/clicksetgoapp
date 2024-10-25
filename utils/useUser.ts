import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    console.error('Error fetching user:', error);
                    setUser(null);
                } else {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}