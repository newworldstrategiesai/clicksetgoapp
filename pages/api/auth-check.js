import { createClient } from '@/utils/supabase/server';

export default async function handler(req, res) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Your protected logic here
  res.status(200).json({ message: 'Success', user });
}
