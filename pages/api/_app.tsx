// pages/_app.tsx
import { UserProvider } from '@/context/UserContext';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Modal from 'react-modal';

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default MyApp;
