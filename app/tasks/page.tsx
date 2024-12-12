export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import TaskPage from './components/TaskPage';

export default async function TasksPage() {
  try {
    const supabase = await createClient(); // Initialize Supabase client
    const user = await getUser(supabase); // Fetch the authenticated user

    if (!user) {
      return redirect('/signin'); // Redirect if user is not authenticated
    }

    return <TaskPage userId={user.id} />; // Render TaskPage with user ID
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
