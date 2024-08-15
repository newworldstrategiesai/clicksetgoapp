// utils/getUserData.ts
import { supabase } from '@/utils/supabaseClient';

export async function fetchUserData() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error retrieving session:', sessionError);
      return null;
    }

    if (!session) {
      console.error('No session found');
      return null;
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}
