import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import PersonaPage from '@/components/PersonaComp';

export default async function PersonaDetailPage() {
  const supabase = createClient();
  
  // Fetch the user
  const user = await getUser(supabase);

  // If no user, redirect to the signin page
  if (!user) {
    console.log('User not authenticated. Redirecting to /signin');
    return redirect('/signin');
  }

  // Fetch the API key for Eleven Labs from Supabase
  const { data, error } = await supabase
    .from('api_keys')
    .select('eleven_labs_key')
    .eq('user_id', user.id)
    .single();

  if (error || !data?.eleven_labs_key) {
    console.error('Failed to fetch Eleven Labs API key');
    return redirect('/signin'); // Handle this case appropriately
  }

  const apiKey = data.eleven_labs_key;

  // Pass the userId and apiKey to PersonaPage as props
  return (
    <section className="min-h-screen bg-gray-900 text-white">
      <div className="pt-[60px] p-4"> {/* Adjust padding to match your layout */}
        <PersonaPage userId={user.id} apiKey={apiKey} />
        <div className="mt-4">Logged in as: {user.id}</div> {/* Display user ID */}
      </div>
    </section>
  );
}
