// pages/api/lists/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid list ID' });
  }

  try {
    // Fetch list and contacts from Supabase
    const { data, error } = await supabase
      .from('lists')
      .select('id, name, contacts (id, first_name, email_address)')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export default handler;
