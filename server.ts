import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';

export const createClient = async (): Promise<ReturnType<typeof createServerClient<Database, "public", any>>> => {
  const cookieStore = await cookies();

  if (!cookieStore) {
    throw new Error('cookieStore is null');
  }

  const getCookie = (name: string): string | null => {
    const cookie = cookieStore.get(name);

    if (!cookie) {
      return null;
    }

    return cookie.value;
  };

  const setCookie = (name: string, value: string, options: CookieOptions): void => {
    try {
      cookieStore.set({ name, value, ...options });
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  };

  const removeCookie = (name: string, options: CookieOptions): void => {
    try {
      cookieStore.set({ name, value: '', ...options });
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  };

  // const removeCookie = (name: string, options: CookieOptions = {}): void => {
  //   try {
  //     // Setting the value to an empty string and the expiry date to the past to remove the cookie
  //     cookieStore.set({ name, value: '', expires: new Date(0), ...options });
  //   } catch (error) {
  //     console.error('Error removing cookie:', error);
  //   }
  // };

  return createServerClient<Database, "public", any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL! as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! as string,
    {
      cookies: {
        get: getCookie,
        set: setCookie,
        remove: removeCookie
      }
    }
  );
};
