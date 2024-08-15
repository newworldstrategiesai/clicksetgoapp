import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.status(200).json({ message: 'Success', session });
}
