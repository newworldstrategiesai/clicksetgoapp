import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { listId, newName } = req.body;

  if (!listId || !newName) {
    return res.status(400).json({ error: 'List ID and new name are required' });
  }

  try {
    // Update the list name in the `lists` table
    const { data, error } = await supabase
      .from('lists')
      .update({ name: newName })
      .eq('id', listId);

    console.log('Supabase Data:', data);
    console.log('Supabase Error:', error);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'List updated successfully' });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}