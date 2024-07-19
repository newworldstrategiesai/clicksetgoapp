// components/ProtectedPage.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from 'utils/supabaseClient'; // Use named import

const ProtectedPage = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const checkUser = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          router.replace('/signin'); // Redirect to login page if not authenticated
        } else {
          setUser(data.session.user);
          setLoading(false);
        }
      };

      checkUser();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>; // Show a loading indicator while checking auth state
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedPage;
