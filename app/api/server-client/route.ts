// app/api/server-client/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const client = async () => createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value || null;
        },
        set(name: string, value: string) {
          try {
            cookieStore.set({ name, value });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string) {
          try {
            cookieStore.set({ name, value: '' });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        }
      }
    }
  );

  // Perform operations with `client`
  return NextResponse.json({ success: true });
}
