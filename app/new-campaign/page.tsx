import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { NewCampaign } from '@/components/new-campaign'; // Ensure this path is correct

export default async function NewCampaignPage() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    return <NewCampaign userId={user.id} />; // Pass user ID as a prop
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
