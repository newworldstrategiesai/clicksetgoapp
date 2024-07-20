'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname() ?? ''; // Ensure pathname is never null

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
          <Link href="/call-logs" className={s.link}>
            Call Logs
          </Link>
          <Link href="/sms-logs" className={s.link}>
            SMS Logs
          </Link>
          <Link href="/contacts" className={s.link}>
            Contacts
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
            Sign out
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
