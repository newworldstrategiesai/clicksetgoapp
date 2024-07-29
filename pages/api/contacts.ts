import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
