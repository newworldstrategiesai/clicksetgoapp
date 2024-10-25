import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { Home } from '@/components/Home';

export default async function ContactDashboardPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
    return null; // Ensures nothing renders after the redirect
  }

  // Fetch user's full name from the database
  const { data: profile } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single();

  const fullName = user?.email || 'User';

  // Return the Home component with the userId and fullName passed as props
  return <Home userId={user.id} fullName={fullName} />;
}
