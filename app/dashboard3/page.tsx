import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { Dashboard3 } from '@/components/Dashboard3';

export default async function ContactDashboardPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Pass the user ID as a prop to Dashboard3
    return <Dashboard3 userId={user.id} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
