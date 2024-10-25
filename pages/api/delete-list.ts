import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { listId } = req.body;

  if (!listId) {
    return res.status(400).json({ error: 'List ID is required' });
  }

  try {
    // Delete the list from the `lists` table
    const { data, error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    console.log('Supabase Data:', data);
    console.log('Supabase Error:', error);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}