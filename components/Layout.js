// /components/Layout.js
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  UserIcon,
  PhoneIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ViewListIcon,
  ChartPieIcon,
  ExclamationCircleIcon,
  ClipboardCheckIcon,
  MenuIcon,
  LibraryIcon,
} from '@heroicons/react/outline';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white">
      <aside className={`lg:w-64 bg-[#161b22] p-4 ${mobileMenuOpen ? 'block' : 'hidden'} lg:block overflow-y-auto`}>
        <div className="flex items-center justify-center mb-8">
          <Image src="/placeholder.svg" alt="NWS Logo" width={350} height={120} className="w-3/4 lg:w-full" />
        </div>
        <nav className="space-y-4">
          <div className="space-y-2 text-[#8b949e]">
            <div>
              <div className="flex items-center justify-between space-x-2 p-2 text-[#c9d1d9] cursor-default">
                <span className="font-semibold">Dashboard</span>
              </div>
              <div className="ml-4 space-y-2">
                <Link href="/overview" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <HomeIcon className="h-5 w-5" />
                  <span>Overview</span>
                </Link>
                <Link href="/phone-numbers" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <PhoneIcon className="h-5 w-5" />
                  <span>Phone Numbers</span>
                </Link>
              </div>
              <hr className="border-gray-700 my-4" />
            </div>

            <div>
              <div className="flex items-center justify-between space-x-2 p-2 text-[#c9d1d9] cursor-default">
                <span className="font-semibold">Agents</span>
              </div>
              <div className="ml-4 space-y-2">
                <Link href="/inbound-agent" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <UserIcon className="h-5 w-5" />
                  <span>Inbound Agent</span>
                </Link>
                <Link href="/outbound-agent" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <UserIcon className="h-5 w-5" />
                  <span>Outbound Agent</span>
                </Link>
                <Link href="/agents" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Agents</span>
                </Link>
                <Link href="/voice-library" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <LibraryIcon className="h-5 w-5" />
                  <span>Voice Library</span>
                </Link>
              </div>
              <hr className="border-gray-700 my-4" />
            </div>

            <div>
              <div className="flex items-center justify-between space-x-2 p-2 text-[#c9d1d9] cursor-default">
                <span className="font-semibold">Call Management</span>
              </div>
              <div className="ml-4 space-y-2">
                <Link href="/campaign" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <ChartPieIcon className="h-5 w-5" />
                  <span>Campaign</span>
                </Link>
                <Link href="/contacts" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <ClipboardCheckIcon className="h-5 w-5" />
                  <span>Contacts</span>
                </Link>
                <Link href="/call-logs" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Call Logs and Recordings</span>
                </Link>
                <Link href="/error-logs" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <span>Error Logs</span>
                </Link>
                <Link href="/sms-logs" className="flex items-center space-x-2 p-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
                  <ViewListIcon className="h-5 w-5" />
                  <span>SMS</span>
                </Link>
              </div>
              <hr className="border-gray-700 my-4" />
            </div>
          </div>
        </nav>
        <div className="mt-auto space-y-4">
          <a href="#" className="flex items-center space-x-2 text-[#c9d1d9] hover:bg-[#2a2e37] hover:text-[#9d4edd]">
            <UserIcon className="h-5 w-5 text-[#9d4edd]" />
            <span className="text-[#9d4edd]">Profile</span>
          </a>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <div className="lg:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
