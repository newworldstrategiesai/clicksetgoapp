import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { ContactDashboard } from '@/components/ContactDashboard';

export default async function ContactDashboardPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    return <ContactDashboard />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
