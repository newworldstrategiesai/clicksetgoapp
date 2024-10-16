import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserProvider } from '@/context/UserContext';
import type { AppProps } from 'next/app';
import Modal from 'react-modal';
import { supabase } from '@/utils/supabaseClient'; // Adjust the path as needed
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Disable the auto CSS injection to avoid any potential conflicts.

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    // Set the app element for modal accessibility
    Modal.setAppElement('#__next'); // Ensure this matches your root element

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
};

export default MyApp;
