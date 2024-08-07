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

      if (listError) throw listError;

      // Fetch contact IDs linked to the list
      const { data: contactLinks, error: linkError } = await supabase
        .from('contact_lists')
        .select('contact_id')
        .eq('list_id', id);

      if (linkError) throw linkError;

      const contactIds = contactLinks.map((link: { contact_id: string }) => link.contact_id);

      if (contactIds.length === 0) {
        return res.status(200).json({ listName: list.name, contacts: [] }); // No contacts found
      }

      // Fetch contact details including phone number
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, phone') // Include phone field
        .in('id', contactIds);

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
