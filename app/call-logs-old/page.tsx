// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

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

    const { data, error } = await supabase
      .from('api_keys' as any) // Cast as 'any' to bypass type checking
      .select('vapi_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch API keys');
      return redirect('/signin'); // Handle this case as appropriate
    }

    const vapiKey = data.vapi_key;

    return <CallLogsClient userId={user.id} vapiKey = {vapiKey} />; // Pass userId to CallLogsClient
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
