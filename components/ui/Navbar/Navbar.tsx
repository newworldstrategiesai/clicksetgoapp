'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navlinks from './Navlinks';
import { useUser } from '@/utils/useUser';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Don't render the navbar when loading
  if (loading) {
    return null;
  }

  const isSignInPage = pathname === '/signin';

  return (
    <nav className="navbar bg-black text-white px-4 py-3 w-full z-10 top-0">
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-6xl px-6 mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          <Link href="/home" className="hover:text-gray-300">CLICK SET GO</Link>
        </div>
        {!isSignInPage && user ? (
          <>
            <div className="hidden md:flex space-x-4">
              <Navlinks />
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div>
            {!isSignInPage && (
              <Link href="/signin" className="hover:text-gray-300">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
      {isOpen && !isSignInPage && user && (
        <div className="md:hidden absolute inset-x-0 top-full bg-black p-4 text-right space-y-2">
          <Navlinks />
        </div>
      )}
    </nav>
  );
};

export default Navbar;