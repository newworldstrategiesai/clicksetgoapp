import { supabase } from '@/utils/supabaseClient';

export default async (req, res) => {
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
      console.error('Error fetching lists:', error.message); // Add debugging information
      return res.status(500).json({ error: error.message });
    }

    console.log('Fetched lists data:', data); // Add debugging information
    res.status(200).json(data);
  } catch (error) {
    console.error('Unexpected error:', error); // Add debugging information
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
