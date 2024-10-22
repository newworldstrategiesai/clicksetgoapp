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
            const { data: { user } } = await supabase.auth.getUser();

            if (!user && router.pathname !== '/signin') {
                router.push('/signin');
            } else if (user && router.pathname === '/signin') {
                router.push('/home');
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
