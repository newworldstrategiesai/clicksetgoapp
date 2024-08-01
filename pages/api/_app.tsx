import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserProvider } from '@/context/UserContext';
import type { AppProps } from 'next/app';
import Modal from 'react-modal';
import { supabase } from 'utils/supabaseClient'; // Adjust the path as needed

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    Modal.setAppElement('#__next');

    // Start listening to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/overview');
      }
    });

    // Cleanup function to unsubscribe from the listener
    return () => {
      if (authListener && typeof authListener === 'object' && 'subscription' in authListener) {
        authListener.subscription?.unsubscribe();  // Check if subscription exists and call unsubscribe
      }
    };
  }, [router]);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default MyApp;
