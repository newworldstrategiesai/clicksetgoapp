// pages/_app.tsx
import { UserProvider } from '@/context/UserContext';
import type { AppProps } from 'next/app';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};

export default MyApp;
