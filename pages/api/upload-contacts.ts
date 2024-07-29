import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contacts } = req.body;

  console.log('Contacts received:', contacts); // Debugging line

  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contacts);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error uploading contacts:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to upload contacts' });
  }
}
