import ProfileSetup from '@/components/ui/AuthForms/ProfileSetup';
import { createClient } from '@/utils/supabase/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfileSetupPage() {
  const supabase = createClient();

  // Retrieve the Supabase access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    // If no token is found, redirect to sign-up
    redirect('/signin/signup');
  }

  // Get user information using the access token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    // If there's an error or no user is found, redirect to sign-up
    redirect('/signin/signup');
  }

  const userId = data.user.id;

  return <ProfileSetup userId={userId} />;
}
