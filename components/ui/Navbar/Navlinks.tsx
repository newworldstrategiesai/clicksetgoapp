'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faClock,
  faUser,
  faTh,
  faVoicemail,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
// import { ThemeToggle } from '@/components/theme-toggle';

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
    <div className="flex flex-col lg:flex-row lg:space-x-4">
      <Link
        href={user ? '/pricing' : '/pricing.html'}
        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
      >
        Pricing
      </Link>
      {user && (
        <>
          <Link
            href="/overview"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/tasks"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Tasks
          </Link>
          <Link
            href="/chat"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Chat
          </Link>

          {/* Campaigns Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isCampaignDropdownOpen}
            >
              Campaigns
            </button>
            {isCampaignDropdownOpen && (
              <div className="absolute z-10 bg-white dark:bg-gray-800 shadow-md mt-2 rounded-md py-2">
                <Link
                  href="/campaigns"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLinkClick}
                >
                  All
                </Link>
                <Link
                  href="/new-campaign"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLinkClick}
                >
                  New
                </Link>
                <Link
                  href="/schedule-new-form"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLinkClick}
                >
                  Schedule form
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/call-logs"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Calls
          </Link>
          <Link
            href="/sms-logs"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Texts
          </Link>
          <Link
            href="/contacts"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Contacts
          </Link>
          <Link
            href="/voice-library"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Voices
          </Link>
          <Link
            href="/dialer"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Dialer
          </Link>
          <Link
            href="/account"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Account
          </Link>
        </>
      )}
      {user ? (
        <form onSubmit={(e) => handleRequest(e, SignOut, router)} className="mt-2 md:mt-0">
          <input type="hidden" name="pathName" value={pathname} />
          <button
            type="submit"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
          >
            Signout
          </button>
        </form>
      ) : (
        <Link
          href="/signin"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md transition-colors"
        >
          Sign In
        </Link>
      )}
      {/* Integrate the ThemeToggle component */}
      {/* <ThemeToggle /> */}
    </div>
  );
}
