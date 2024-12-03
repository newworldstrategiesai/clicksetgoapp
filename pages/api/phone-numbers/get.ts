// pages/api/phone-numbers/get.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/app/server.server';
import { getUser } from '@/utils/supabase/queries';
import twilio from 'twilio';

// Define the TwilioNumber interface
interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Parse the request body
    const { user_Id: userId, twilioClient } = req.body;

    // Validate input
    if (!twilioClient || !twilioClient.twilioSid || !twilioClient.twilioAuthToken) {
      return res.status(400).json({ message: 'Invalid Twilio credentials' });
    }

    // Initialize Twilio client
    const client = twilio(twilioClient.twilioSid, twilioClient.twilioAuthToken);

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
    const allNumbers = [...twilioNumbers, ...callerIds].reduce((acc, current) => {
      if (!acc.find((item) => item.phoneNumber === current.phoneNumber)) {
        acc.push(current);
      }
      return acc;
    }, [] as TwilioNumber[]);

    return res.status(200).json({ allNumbers });
  } catch (error: any) {
    console.error('Error fetching Twilio numbers or verified caller IDs:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return res.status(500).json({
      message: 'Error fetching Twilio data',
      error: errorMessage,
    });
  }
}
