import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Contact ID is required' });
    }

    try {
      // Delete the contact from Supabase
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error.message);
        return res.status(500).json({ message: 'Failed to delete contact', error: error.message });
      }

      return res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Unexpected error deleting contact:', error);
      return res.status(500).json({ message: 'An unexpected error occurred', error });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
