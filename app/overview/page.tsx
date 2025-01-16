// app/dashboard/overview/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import OverViewClient from '@/app/dashboard/overview/OverviewClient'; // Ensure the path is correct

export const dynamic = 'force-dynamic'; // Ensures dynamic rendering

export default async function OverViewPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    const { data, error } = await supabase
      .from('api_keys' as any)
      .select('vapi_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch API keys', error);
      // return redirect('/signin'); // Redirect or handle as appropriate
    }

    const vapiKey = data?.vapi_key;

    // Pass only userId and vapiKey as props to OverViewClient
    return <OverViewClient userId={user.id} vapiKey={vapiKey} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
