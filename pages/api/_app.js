import { useEffect } from 'react';
import { supabase } from 'utils/supabaseClient.js';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // Handle user signed in
        } else if (event === 'SIGNED_OUT') {
          router.replace('/login'); // Redirect to login page on sign out
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
