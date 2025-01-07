'use client';

import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import { CountryProvider } from '@/context/CountryContext';
import { UserProvider } from '@/context/UserContext';
import { MainNav } from '@/components/main-nav';
import { MobileNav } from '@/components/mobile-nav';

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hideFooterRoutes = [
    '/dialer', '/call-logs', '/overview', '/dialer2', '/voice-library',
    '/chat', '/leads', '/contracts', '/calls', '/marketing', '/events',
    '/emails', '/sms', '/agents', '/leads/pipeline/automation',
    '/leads/pipeline', '/requests', '/equipment', '/venues', '/playlists',
    '/analytics', '/settings', '/account', '/campaigns', '/signin',
    '/contacts', '/lists', '/sms-logs', '/tasks', '/new-campaign', '/campaigns',
    '/editCampaign', '/customization/persona', '/schedule-new-form', '/pricing', '/inbound'
  ];
  const hideSideBar = [
    '/signin',
    '/signup',
    '/signin/password_signin',
    '/signin/signup',
    '/signin/email_signin'
  ]

  const hideMobileNavRoutes = [
    '/chat',
    '/signin',
    '/signin/password_signin',
    '/dialer'
  ];

  const hideNavbarMobileRoutes = [
    '/chat',
    '/signin',
    '/signin/password_signin',
    '/dialer'
  ];

  const shouldHideNavbar = hideNavbarMobileRoutes.includes(pathname || '');
  const shouldHideMobileNav = hideMobileNavRoutes.includes(pathname || '');
  const shouldHideFooter = hideFooterRoutes.some(route => pathname?.startsWith(route))
  return (
    <html lang="en" className="transition-colors duration-300">
      <body className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          <UserProvider>
            <div className="flex h-screen">
              { !hideSideBar.includes(pathname || '') &&
              <aside className="hidden md:block w-64 border-r bg-background dark:bg-black transition-colors duration-300">
                <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white"></h1>
                </div>
                <MainNav />
              </aside>
              }

              <div className="flex-1 flex flex-col">
                <div className={cn(
                  'md:block', // Always show on desktop
                  shouldHideNavbar ? 'hidden' : 'block' // Hide on mobile for specific routes
                )}>
                  <Navbar />
                </div>
                <main
                  id="skip"
                  className={cn(
                    "min-h-[calc(100dvh-4rem)]",
                    "md:min-h-[calc(100dvh-5rem)]",
                    shouldHideNavbar ? "mt-0" : "mt-3" // Remove top margin when navbar is hidden
                  )}

                >
                  <CountryProvider>{children}</CountryProvider>
                </main>
                {!shouldHideFooter && <Footer />}
              </div>
            </div>
          </UserProvider>

          {/* Mobile Navigation - conditionally rendered */}
          {!shouldHideMobileNav && <MobileNav />}

          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
