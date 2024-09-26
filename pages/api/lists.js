import { supabase } from '@/utils/supabaseClient';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching lists:', error.message);
      return res.status(500).json({ error: 'Failed to fetch lists from Supabase' });
    }

    console.log('Fetched lists data:', data); // Debugging output
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
