import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contacts, clientID } = req.body;

  if (!contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Invalid request format. Contacts must be an array.' });
  }

  try {
    // Extract phone numbers from contacts
    const phoneNumbers = contacts.map((contact) => contact.phone).filter(Boolean);

    // Fetch existing contacts with matching phone numbers
    const { data: existingContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('phone')
      .eq("user_id", clientID )
      .in('phone', phoneNumbers);

    if (fetchError) {
      throw new Error(`Error fetching existing contacts: ${fetchError.message}`);
    }

    // Identify duplicates and new contacts
    const existingPhones = new Set(existingContacts?.map((contact) => contact.phone));
    const duplicates = contacts.filter((contact) => existingPhones.has(contact.phone));
    const newContacts = contacts.filter((contact) => !existingPhones.has(contact.phone));

    // Insert only new contacts
    if (newContacts.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('contacts')
        .insert(newContacts);

      if (insertError) {
        throw new Error(`Error inserting new contacts: ${insertError.message}`);
      }

      // Return success response for inserted contacts
      return res.status(200).json({
        message: 'Contacts uploaded successfully.',
        inserted: insertedData,
        duplicates,
      });
    }

    // If no new contacts, return duplicates
    return res.status(200).json({
      message: 'No new contacts to upload. All provided contacts are duplicates.',
      duplicates,
    });

  } catch (error) {
    console.error('Error processing contacts:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: 'Failed to process contacts.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
