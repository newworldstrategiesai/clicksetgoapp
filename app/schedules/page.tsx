// app/schedules/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { ScheduleNewForm } from '@/components/schedule-new-form'; // Ensure this path is correct

export default async function SchedulesPage() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Pass user ID to ScheduleNewForm
    return <ScheduleNewForm userId={user.id} className="full-screen" />; // Added class for styling
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
