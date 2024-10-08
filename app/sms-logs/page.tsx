import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import SMSLogsClient from '@/components/SMSLogsClient';

export default async function SMSLogsPage() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    return <SMSLogsClient userId={user.id} />; // Pass userId as a prop
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
