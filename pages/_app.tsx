// import type { AppProps } from 'next/app';
// import AuthWrapper from '@/components/AuthWrapper';

// function MyApp({ Component, pageProps }: AppProps) {
//   return (
//     <AuthWrapper>
//       <Component {...pageProps} />
//     </AuthWrapper>
//   );
// }

// export default MyApp;


// Including AuthWrapper

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/server';
import type { AppProps } from 'next/app';
import { UserProvider } from '@/context/UserContext';
import Modal from 'react-modal';
import { supabase } from '@/utils/supabaseClient';

/**
 * @typedef {Object} AuthWrapperProps
 * @property {React.ReactNode} children
 */

/**
 * @param {AuthWrapperProps} props
 */
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Set the app element for modal accessibility
    Modal.setAppElement('#__next');

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);

        if (session) {
          // Redirect to /home if the user is already logged in
          router.push('/home');
        } else {
          // Redirect to /login if no session exists
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/login');
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/home');
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      if (authListener && typeof authListener === 'object' && 'subscription' in authListener) {
        authListener.subscription?.unsubscribe();
      }
    };
  }, [router]);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
