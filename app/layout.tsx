"use client";

import { useState } from 'react';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import 'styles/main.css';
import { CountryProvider } from '@/context/CountryContext';
import { UserProvider } from '@/context/UserContext';

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hideFooterRoutes = ['/dialer'];

  return (
    <html lang="en">
      <body className="bg-black">
        <UserProvider>
          <div className="flex">
            {/* Sidebar */}

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main
                id="skip"
                className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] mt-8"
              >
                <CountryProvider>{children}</CountryProvider>
              </main>
              {!hideFooterRoutes.includes(pathname || '') && <Footer />}
            </div>
          </div>
        </UserProvider>

        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
