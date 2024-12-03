'use client';

import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css'; // Ensure Tailwind's CSS is imported
import { CountryProvider } from '@/context/CountryContext';
import { UserProvider } from '@/context/UserContext';
import { MainNav } from '@/components/main-nav'; // Import MainNav
import { MobileNav } from '@/components/mobile-nav'; // Import MobileNav

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hideFooterRoutes = [
    '/dialer',
    '/call-logs',
    '/overview',
    '/dialer2',
    '/voice-library',
    '/chat',
    '/leads',
    '/contracts',
    '/calls',
    '/marketing',
    '/events',
    '/emails',
    '/sms',
    '/agents',
    '/leads/pipeline/automation',
    '/leads/pipeline',
    '/requests',
    '/equipment',
    '/venues',
    '/playlists',
    '/analytics',
    '/settings',
    '/account',
    '/campaigns',
    '/signin',
    '/contacts',
    '/lists',
    '/sms-logs',
    '/tasks',
  ];

  return (
    <html lang="en" className="transition-colors duration-300">
      <body className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        {/* Corrected the ThemeProvider attribute */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          <UserProvider>
            <div className="flex h-screen">
              {/* Sidebar */}
              <aside className="hidden md:block w-64 border-r bg-background dark:bg-black transition-colors duration-300">
                <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">DJ MODE</h1>
                </div>
                <MainNav /> {/* Include MainNav */}
              </aside>

              {/* Main content area */}
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main
                  id="skip"
                  className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)] mt-3"
                >
                  <CountryProvider>{children}</CountryProvider>
                </main>
                {!hideFooterRoutes.includes(pathname || '') && <Footer />}
              </div>
            </div>
          </UserProvider>

          {/* Mobile Navigation */}
          <MobileNav />

          {/* Toast Notifications */}
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
