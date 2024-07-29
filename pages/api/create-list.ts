import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { name, contacts } = req.body;

  if (!name || !contacts || contacts.length === 0) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    const { data: list, error: listError } = await supabase
      .from('lists')
      .insert([{ name }])
      .select()
      .single();

    if (listError) {
      throw listError;
    }

    const listId = list.id;

    const contactListData = contacts.map((contactId: string) => ({
      list_id: listId,
      contact_id: contactId,
    }));

    const { error: contactListError } = await supabase
      .from('contact_lists')
      .insert(contactListData);

    if (contactListError) {
      throw contactListError;
    }

    res.status(200).json({ id: listId, message: 'List created successfully' });
  } catch (error) {
    console.error('Error creating list:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ message: 'Failed to create list', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
