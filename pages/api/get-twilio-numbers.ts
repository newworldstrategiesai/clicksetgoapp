// pages/api/get-twilio-numbers.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { supabase } from '@/utils/supabaseClient'; // <-- Adjust import path if needed

type TwilioNumber = {
  sid: string;
  phoneNumber: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1) Start with environment defaults (or empty strings).
  let accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  let authToken = process.env.TWILIO_AUTH_TOKEN || '';

  try {
    // Debug: See what the request body looks like
    console.log('[get-twilio-numbers] Request body:', req.body);

    // 2) If there's a userId, attempt to fetch credentials from Supabase
    if (req.body?.userId) {
      const userId = req.body.userId as string;
      console.log(`[get-twilio-numbers] Looking up credentials for userId=${userId}`);

      const { data, error } = await supabase
        .from('api_keys')
        .select('twilio_sid, twilio_auth_token')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[get-twilio-numbers] Supabase error:', error.message);
        // We won't throw here; we'll let it fallback to env or twilioClient override
      } else if (data) {
        // If Supabase returns a row, use it
        console.log('[get-twilio-numbers] Fetched credentials from Supabase:', data);
        accountSid = data.twilio_sid || accountSid;
        authToken = data.twilio_auth_token || authToken;
      } else {
        console.warn('[get-twilio-numbers] No credentials found for this user in Supabase.');
      }
    }

    // 3) OPTIONAL: If the request body includes credentials, let them override
    if (req.body?.twilioClient?.twilioSid && req.body?.twilioClient?.twilioAuthToken) {
      console.log('[get-twilio-numbers] Overriding with credentials from request body.');
      accountSid = req.body.twilioClient.twilioSid;
      authToken = req.body.twilioClient.twilioAuthToken;
    }

    // 4) If no credentials are set, return an error
    if (!accountSid || !authToken) {
      console.error('[get-twilio-numbers] Twilio credentials are not set at all.');
      return res.status(500).json({ message: 'Twilio credentials are not set' });
    }

    // Debug: Show final credentials used (hide or mask token for security in production)
    console.log('[get-twilio-numbers] Using accountSid:', accountSid);
    console.log('[get-twilio-numbers] Using authToken length:', authToken.length);

    // 5) Use the Twilio client
    const client = twilio(accountSid, authToken);

    // 6) Fetch incoming Twilio phone numbers
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({ limit: 100 });
    const twilioNumbers: TwilioNumber[] = incomingPhoneNumbers.map((number) => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
    }));

    // 7) Fetch verified outgoing caller IDs
    const verifiedCallerIds = await client.outgoingCallerIds.list({ limit: 100 });
    const callerIds: TwilioNumber[] = verifiedCallerIds.map((id) => ({
      sid: id.sid,
      phoneNumber: id.phoneNumber,
    }));

    // 8) Combine both lists and remove duplicates based on phoneNumber
    const allNumbers = [...twilioNumbers, ...callerIds].reduce(
      (acc: TwilioNumber[], current: TwilioNumber) => {
        if (!acc.find((item) => item.phoneNumber === current.phoneNumber)) {
          acc.push(current);
        }
        return acc;
      },
      []
    );

    // Debug: Show how many numbers we found
    console.log('[get-twilio-numbers] Found total numbers:', allNumbers.length);

    return res.status(200).json({ allNumbers });
  } catch (error) {
    console.error('Error fetching Twilio numbers or verified caller IDs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return res.status(500).json({
      message: 'Error fetching Twilio data',
      error: errorMessage,
    });
  }
}
