// pages/api/phone-numbers/delete.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/server'; // Adjust the import path as needed
import { getApiKeys } from '@/utils/supabase/queries'; // Function to get API keys
import twilio from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { sid, userId } = req.body;

    if (!sid || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const supabase = await createClient();

    // Fetch the API keys from Supabase
    const apiKeys = await getApiKeys(supabase, userId as string);

    if (!apiKeys) {
      return res.status(404).json({ error: 'No API keys found for the user' });
    }

    const twilioSid = apiKeys.twilio_sid;
    const twilioAuthToken = apiKeys.twilio_auth_token;

    if (!twilioSid || !twilioAuthToken) {
      return res.status(500).json({ error: 'Twilio credentials not found' });
    }

    const client = twilio(twilioSid, twilioAuthToken);

    // Delete the phone number
    await client.incomingPhoneNumbers(sid).remove();

    return res.status(200).json({ message: 'Phone number deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting phone number:', error);
    return res.status(500).json({ error: 'Failed to delete phone number' });
  }
}
