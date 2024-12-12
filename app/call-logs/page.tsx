// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { CallLogsPage } from '@/components/CallLogLatestUI';

export default async function CallLogs() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);
    if (!user) {
      return redirect('/signin');
    }
    return (
      <>
        <CallLogsPage user={user.id} />
      </>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
