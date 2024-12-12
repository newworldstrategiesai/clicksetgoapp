// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import TaskPage from './components/TaskPage';

export default async function TasksPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    return <TaskPage userId={user.id} />; // Pass userId to CallLogsClient
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
