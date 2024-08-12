import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/server'; // Server-side only
import { getUser } from '@/utils/supabase/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();
  try {
    const user = await getUser(supabase);

    if (user === null) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error('Error fetching user data:', error); // Log the error for debugging
    res.status(500).json({ error: 'Error fetching user data' });
  }
}
