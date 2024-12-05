// pages/api/phone-numbers/get.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/server'; // Adjust the import path as needed
import { getApiKeys } from '@/utils/supabase/queries'; // Function to get API keys
import twilio from 'twilio';

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const supabase = await createClient();

    // Fetch the API keys from Supabase
    const apiKeys = await getApiKeys(supabase, userId as string);

    if (!apiKeys) {
      return res.status(404).json({ message: 'No API keys found for the user' });
    }

    const twilioSid = apiKeys.twilio_sid;
    const twilioAuthToken = apiKeys.twilio_auth_token;

    if (!twilioSid || !twilioAuthToken) {
      return res.status(500).json({ message: 'Twilio credentials not found' });
    }

    // Initialize Twilio client
    const client = twilio(twilioSid, twilioAuthToken);

    // Fetch incoming Twilio phone numbers
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({ limit: 100 });
    const twilioNumbers: TwilioNumber[] = incomingPhoneNumbers.map((number) => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
    }));

    // Fetch verified outgoing caller IDs
    const verifiedCallerIds = await client.outgoingCallerIds.list({ limit: 100 });
    const callerIds: TwilioNumber[] = verifiedCallerIds.map((id) => ({
      sid: id.sid,
      phoneNumber: id.phoneNumber,
    }));

    // Combine both lists and remove duplicates based on phone number
    const allNumbersMap = new Map<string, TwilioNumber>();

    twilioNumbers.forEach((number) => {
      allNumbersMap.set(number.phoneNumber, number);
    });

    callerIds.forEach((id) => {
      if (!allNumbersMap.has(id.phoneNumber)) {
        allNumbersMap.set(id.phoneNumber, id);
      }
    });

    const allNumbers = Array.from(allNumbersMap.values());

    return res.status(200).json({ allNumbers });
  } catch (error: any) {
    console.error('Error fetching Twilio data:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return res.status(500).json({
      message: 'Error fetching Twilio data',
      error: errorMessage,
    });
  }
}
