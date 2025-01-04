// app/admin/live-calls/page.tsx

export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { LiveCallMonitorPage } from '@/components/LiveCallMonitorUI'; // Ensure correct import

export default async function LiveCallMonitor() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);
    if (!user) {
      return redirect('/signin');
    }
    return (
      <>
        <LiveCallMonitorPage userId={user.id} /> {/* Changed prop name from 'user' to 'userId' */}
      </>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
