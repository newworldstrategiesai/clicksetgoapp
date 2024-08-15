import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { listId, contactId } = req.body;

  if (!listId || !contactId) {
    return res.status(400).json({ error: 'List ID and Contact ID are required' });
  }

  try {
    // Add contact to the list in the `contact_lists` table
    const { data, error } = await supabase
      .from('contact_lists')
      .upsert({ list_id: listId, contact_id: contactId });

    console.log('Supabase Data:', data);
    console.log('Supabase Error:', error);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Contact added to list successfully' });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}
