// pages/_app.tsx

import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { UserProvider } from '@/context/UserContext';
import Modal from 'react-modal';
import { supabase } from '@/utils/supabaseClient';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import '../styles/globals.css'; // Adjust the path as necessary

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Set the app element for modal accessibility
    Modal.setAppElement('#__next');
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);

        if (session) {
          // Redirect to /home if the user is already logged in
          // Note: Using client-side navigation; ensure this logic aligns with your app's flow
        } else {
          // Redirect to /login if no session exists
          // Note: Using client-side navigation; ensure this logic aligns with your app's flow
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Handle session errors
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle sign-in
      } else if (event === 'SIGNED_OUT') {
        // Handle sign-out
      }
    });

    return () => {
      if (authListener && typeof authListener === 'object' && 'subscription' in authListener) {
        authListener.subscription?.unsubscribe();
      }
    };
  }, []);

  return (
    <UserProvider>
      <Component {...pageProps} />
      <ToastContainer /> {/* Include ToastContainer globally */}
    </UserProvider>
  );
}

export default MyApp;
