'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Navlinks from './Navlinks';
import { ThemeToggle } from '@/components/theme-toggle';
import clsx from 'clsx'; // Utility for conditional classNames

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (loading) {
    return <div className="text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  // Determine the link destination based on user authentication
  const homeLink = user ? '/home' : '/index.html';

  return (
    <nav className="navbar bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-4 py-3 w-full z-10 top-0 shadow-md transition-colors duration-300">
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        <div className="text-xl mr-6 font-bold">
          {/* Conditional redirect for the link */}
          <a
            href={homeLink}
            className="hover:text-gray-500 text-lg sm:text-xl md:text-2xl lg:text-2xl whitespace-nowrap transition-colors duration-300"
          >
            
          </a>
        </div>
        {/* Navbar Links - Only shown on large screens and above */}
        <div className="hidden lg:flex space-x-4">
          <Navlinks user={user} />
        </div>
        {/* Theme Toggle and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6" // Add rotate class for medium to large screens
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
        </div>
      </div>
      {/* Mobile Navigation - conditionally rendered */}
      {isOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-white dark:bg-black p-4 space-y-2 transition-colors duration-300">
          <Navlinks user={user} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
