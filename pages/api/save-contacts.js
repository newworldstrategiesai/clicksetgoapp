import { createClient } from '@/utils/supabase/server';

const supabase = createClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { contacts } = req.body;

    console.log('Received contacts:', contacts);

    try {
      const { data, error } = await supabase.from('contacts').insert(contacts);

      if (error) {
        console.error('Error inserting contacts:', error);
        return res.status(500).json({ error: 'Error inserting contacts' });
      }

      res.status(200).json({ data });
    } catch (error) {
      console.error('Error saving contacts:', error);
      res.status(500).json({ error: 'Error saving contacts' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
