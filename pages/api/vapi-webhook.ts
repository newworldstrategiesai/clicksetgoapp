import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient'; // Ensure this import points to your Supabase client

const AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = req.body;
  const phoneNumber = data.message?.customer?.number?.replace(/\D/g, '');

  console.log('Received data:', data);
  console.log('Extracted phone number:', phoneNumber);

  try {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('first_name, phone')
      .eq('phone', phoneNumber);

    if (error) throw error;

    const contact = contacts.length > 0 ? contacts[0] : null;
    const firstName = contact ? contact.first_name : 'Unknown';

    console.log('Determined first name:', firstName);

    // Emit the new message to all connected clients (if using Socket.IO)
    // io.emit('newMessage', { firstName, phoneNumber });

    const responsePayload = {
      status: 'success',
      received: { firstName, phoneNumber }
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching contact from Supabase:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

export default handler;
