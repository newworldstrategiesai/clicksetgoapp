import { supabase } from '@/utils/supabaseClient';

export default async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};
