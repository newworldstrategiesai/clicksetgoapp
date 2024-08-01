import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string
);

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch contacts from Supabase
    const { data: contacts, error: supabaseError } = await supabase.from('contacts').select('*');
    if (supabaseError) {
      console.error('Supabase Error:', supabaseError);
      throw supabaseError;
    }

    // Fetch SMS logs from Twilio
    const messages = await client.messages.list({ limit: 1000 });

    // Format messages and match with contact names
    const formattedMessages = messages.map((msg) => {
      const contact = contacts.find(
        (contact) =>
          contact.phone === msg.from || contact.phone === msg.to
      );
      return {
        id: msg.sid,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        dateSent: msg.dateSent.toISOString(),
        contactName: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown'
      };
    });

    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);

    // Type guard to check if error is an instance of Error
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';

    res.status(500).json({ error: 'Failed to fetch SMS logs', details: errorMessage });
  }
}
