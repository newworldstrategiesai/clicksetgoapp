import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/server'; // Adjust the server import path
import { getUser } from '@/utils/supabase/queries'; // Ensure this function is fetching user data correctly
import Agents from '@/components/ui/Agents/Agents';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  try {
    const supabase = await createClient(); // Create the supabase client
    const user = await getUser(supabase); // Fetch the user from the Supabase queries

    if (!user) {
      // If user is not found, redirect to sign-in page
      return redirect('/signin');
    }

    // Pass the user data (e.g., user.id) as a prop to the Agents component
    return <Agents userId={user.id} />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
