"use client"; // Mark as a Client Component

import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname to get current route
import 'styles/main.css';

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname(); // Get the current path

  // Define routes where you don't want to show the footer
  const hideFooterRoutes = ['/dialer'];

  return (
    <html lang="en">
      <body className="bg-black">
        <Navbar />
        <main
          id="skip"
          className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]" style={{marginTop:"3.7rem"}}
        >
          {children}
        </main>
    
        {/* Conditionally render the Footer */}
        {!hideFooterRoutes.includes(pathname || '') && <Footer />}

        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
