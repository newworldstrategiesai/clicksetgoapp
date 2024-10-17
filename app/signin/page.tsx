import { redirect } from 'next/navigation';
import { getDefaultSignInView } from '@/utils/auth-helpers/settings';
import { cookies } from 'next/headers';
import { createClient } from '@/server';

export default async function SignIn() {
  // Check if the user is already logged in
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // If user is logged in, redirect to the home page
    return redirect('/home');
  }
  // If user is not logged in, proceed with the normal sign-in flow
  const preferredSignInView = cookies().get('preferredSignInView')?.value || null;
  const defaultView = getDefaultSignInView(preferredSignInView);  
  return redirect(`/signin/${defaultView}`);
}