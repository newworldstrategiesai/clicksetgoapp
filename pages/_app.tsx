import type { AppProps } from 'next/app';
import AuthWrapper from '@/components/AuthWrapper';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthWrapper>
      <Component {...pageProps} />
    </AuthWrapper>
  );
}

export default MyApp;


// Including AuthWrapper

// import { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { createClient } from '@/server';
// import type { AppProps } from 'next/app';

// /**
//  * @typedef {Object} AuthWrapperProps
//  * @property {React.ReactNode} children
//  */

// /**
//  * @param {AuthWrapperProps} props
//  */
// function MyApp({ Component, pageProps }: AppProps) {
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const supabase = createClient();
//       const { data: { user } } = await supabase.auth.getUser();

//       if (!user && router.pathname !== '/signin') {
//         router.push('/signin');
//       } else if (user && router.pathname === '/signin') {
//         router.push('/home');
//       }
//     };

//     checkAuth();

//     // Handle back button
//     const handlePopState = () => {
//       if (router.pathname === '/home') {
//         window.location.href = '/index.html';
//       }
//     };

//     window.addEventListener('popstate', handlePopState);

//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, [router]);

//   return <Component {...pageProps} />;
// }

// export default MyApp;