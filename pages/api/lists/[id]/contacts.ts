// pages/api/lists/[id]/contacts.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'utils/supabaseClient'; // Adjust the import path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Validate the id type
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Fetch list details to get the list name
      const { data: list, error: listError } = await supabase
        .from('lists')
        .select('name')
        .eq('id', id)
        .single();

      if (listError || !list) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Fetch contact IDs that belong to the specified list
      const { data: contactIdsData, error: idError } = await supabase
        .from('contact_lists')
        .select('contact_id')
        .eq('list_id', id);

      if (idError) throw idError;

      // Extract the contact IDs into an array
      const contactIds = contactIdsData?.map(contact => contact.contact_id) || [];

      // Fetch contacts based on the list of contact IDs
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, phone')
        .in('id', contactIds); // Use the extracted contact IDs

      if (contactError) throw contactError;

      res.status(200).json({ listName: list.name, contacts });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
