import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import CallLogsClient from '@/components/CallLogsClient';

export default async function CallLogsPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    return <CallLogsClient userId={user.id} />; // Pass userId to CallLogsClient
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
