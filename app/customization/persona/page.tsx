import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import PersonaPage from '@/components/PersonaComp';

export default async function PersonaDetailPage() {
  const supabase = await createClient();
  
  // Fetch the user
  const user = await getUser(supabase);

  // If no user, redirect to the signin page
  if (!user) {
    console.log('User not authenticated. Redirecting to /signin');
    return redirect('/signin');
  }

  // Ensure 'api_keys' is a valid table in your Supabase schema
  const { data, error } = await supabase
    .from('api_keys' as 'customers') // Use type assertion to bypass type checking
    .select('eleven_labs_key')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Query error:', error);
    return redirect('/signin'); // Handle this case appropriately
  }

  // Check if data is defined and has the expected property
  if (!data || !('eleven_labs_key' in data)) { // Check if 'eleven_labs_key' exists in data
    console.error('Failed to fetch Eleven Labs API key');
    return redirect('/signin'); // Handle this case appropriately
  }

  const apiKey: string = typeof data.eleven_labs_key === 'string' ? data.eleven_labs_key : '';

  // Pass the userId and apiKey to PersonaPage as props
  const userId: string = user.id as string; // Ensure user.id is treated as a string
  return (
    <section className="min-h-screen bg-gray-900 text-white">
      <div className="pt-[60px] p-4"> {/* Adjust padding to match your layout */}
        <PersonaPage userId={userId} apiKey={apiKey} />
        <div className="mt-4">Logged in as: {user.id}</div> {/* Display user ID */}
      </div>
    </section>
  );
}
