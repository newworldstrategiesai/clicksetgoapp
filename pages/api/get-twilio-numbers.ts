import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

type TwilioNumber = {
  sid: string;
  phoneNumber: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return res.status(500).json({ message: 'Twilio credentials are not set' });
  }

  const client = twilio(accountSid, authToken);

  try {
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
    const twilioNumbers: TwilioNumber[] = incomingPhoneNumbers.map(number => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
    }));

    const verifiedCallerIds = await client.outgoingCallerIds.list();
    const callerIds: TwilioNumber[] = verifiedCallerIds.map(id => ({
      sid: id.sid,
      phoneNumber: id.phoneNumber,
    }));

    const allNumbers = [...twilioNumbers, ...callerIds];

    return res.status(200).json({ allNumbers });
  } catch (error) {
    console.error('Error fetching Twilio numbers or verified caller IDs:', error);
    
    // Type assertion for error to be of type Error
    const errorMessage = (error as Error).message || 'Unknown error';

    return res.status(500).json({
      message: 'Error fetching Twilio numbers or verified caller IDs',
      error: errorMessage,
    });
  }
}
