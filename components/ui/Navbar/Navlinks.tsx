'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useState } from 'react';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname() ?? ''; // Ensure pathname is never null

  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);

  // Close dropdown when navigating to a new page
  const handleLinkClick = () => {
    setIsCampaignDropdownOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:space-x-4">
      <Link href="/pricing" className={s.link}>
        Pricing
      </Link>
      {user && (
        <>
          <Link href="/overview" className={s.link}>
            Overview
          </Link>
          
          {/* Campaigns Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
              className={s.link}
            >
              Campaigns
            </button>
            {isCampaignDropdownOpen && (
              <div className="absolute z-10 bg-white shadow-md mt-2 rounded-md py-2">
                <Link href="/campaigns" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>
                  All
                </Link>
                <Link href="/new-campaign" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>
                  New
                </Link>
                <Link href="/schedule-new-form" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={handleLinkClick}>
                  Schedule form
                </Link>
              </div>
            )}
          </div>

          <Link href="/call-logs" className={s.link}>
            Calls
          </Link>
          <Link href="/sms-logs" className={s.link}>
            Texts
          </Link>
          <Link href="/contacts" className={s.link}>
            Contacts
          </Link>
          <Link href="/voice-library" className={s.link}>
            Voices
          </Link>
          <Link href="/dialer" className={s.link}>
            Dialer
          </Link>
          <Link href="/account" className={s.link}>
            Account
          </Link>
        </>
      )}
      {user ? (
        <form onSubmit={(e) => handleRequest(e, SignOut, router)} className="mt-2 md:mt-0">
          <input type="hidden" name="pathName" value={pathname} />
          <button type="submit" className={s.link}>
            Signout
          </button>
        </form>
      ) : (
        <Link href="/signin" className={s.link}>
          Sign In
        </Link>
      )}
    </div>
  );
}
