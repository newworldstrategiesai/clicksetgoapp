import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_id } = req.query;

    try {
      const { data, error } = await supabase
        .from('lists')
        .select('id, name, contacts (id)')
        .eq('user_id', user_id);

      if (error) {
        throw error;
      }

      const lists = data.map((list) => ({
        id: list.id,
        name: list.name,
        contactsCount: list.contacts.length,
      }));

      res.status(200).json(lists);
    } catch (error) {
      console.error('Error fetching lists:', error.message);
      res.status(500).json({ message: 'Failed to fetch lists', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
