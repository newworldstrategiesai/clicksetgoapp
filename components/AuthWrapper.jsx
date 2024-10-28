import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/utils/createClient';

// Props type definition using JSDoc
/**
 * @typedef {Object} AuthWrapperProps
 * @property {React.ReactNode} children
 */

/**
 * @param {AuthWrapperProps} props
 */
export default function AuthWrapper({ children }) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            // Check if there was an error fetching the session
            if (sessionError || !session) {
                router.push('/signin'); // Redirect to sign-in if session is invalid
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();

            // Check if there was an error fetching the user
            if (userError || !user) {
                router.push('/signin'); // Redirect to sign-in if user is not found
            } else if (user && router.pathname === '/signin') {
                router.push('/home'); // Redirect to home if already signed in
            }
        };

        checkAuth();

        // Handle back button
        const handlePopState = () => {
            if (router.pathname === '/home') {
                window.location.href = '/index.html';
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router]);

    return <>{children}</>;
}
