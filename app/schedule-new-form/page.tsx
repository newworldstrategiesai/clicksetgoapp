import { redirect } from 'next/navigation';
import { createClient } from '@/server'; // Ensure this imports Supabase correctly
import { getUser } from '@/utils/supabase/queries'; // Confirm this is the correct path to the getUser function
import { ScheduleNewForm } from '@/components/schedule-new-form'; // Adjust this path if needed

export default async function ScheduleNewFormPage() {
  try {
    const supabase = await createClient();

    // Fetch the logged-in user
    const user = await getUser(supabase);

    // If no user is found, redirect to sign-in
    if (!user) {
      console.error('No user found. Redirecting to sign in.');
      return redirect('/signin');
    }

    console.log('User found:', user); // Debugging user retrieval

    // Render the ScheduleNewForm component with the userId passed as a prop
    return (
      <div className="pt-16">
        <ScheduleNewForm userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}