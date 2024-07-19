"use client"; // This marks the component as a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for routing
import { supabase } from 'utils/supabaseClient';

const ProtectedPage = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/signin'); // Redirect to login page if not authenticated
        } else {
          setLoading(false); // Set loading to false if authenticated
        }
      };

      checkUser();
    }, [router]);

    if (loading) {
      return <p>Loading...</p>; // Show a loading state while checking authentication
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedPage;
