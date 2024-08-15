'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state
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
      setLoading(false); // Set loading to false after user data is fetched
    };

    getUser();
  }, []);

  // Close the menu when the pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Render a loading state initially if user data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="navbar bg-black text-white px-4 py-3 fixed w-full z-10 top-0">
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-6xl px-6 mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          <a href="/" className="hover:text-gray-300">CLICK SET GO</a>
        </div>
        <div className="hidden md:flex space-x-4">
          <Navlinks user={user} />
        </div>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
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
      </div>
      {isOpen && (
        <div className="md:hidden mt-2 space-y-2">
          <Navlinks user={user} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
