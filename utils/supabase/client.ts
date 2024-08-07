import { createPagesBrowserClient, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';

export const createClient = (req?: any, res?: any) => {
  if (typeof window === 'undefined') {
    // Server-side
    return createPagesServerClient<Database>({ req, res });
  } else {
    // Client-side
    return createPagesBrowserClient<Database>();
  }
};
