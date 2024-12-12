import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

type TwilioNumber = {
  sid: string;
  phoneNumber: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_Id: userId , twilioClient: twilioClient} = req.body;

  if (!twilioClient || twilioClient.length === 0) {
    return res.status(404).json({ message: 'No Twilio credentials found for the user' });
  }

  const accountSid = twilioClient.twilioSid;
  const authToken = twilioClient.twilioAuthToken;

  if (!accountSid || !authToken) {
    return res.status(500).json({ message: 'Twilio credentials are not set' });
  }

  const client = twilio(accountSid, authToken);

  try {
    // Fetch incoming Twilio phone numbers
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({ limit: 100 });
    const twilioNumbers: TwilioNumber[] = incomingPhoneNumbers.map(number => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
    }));

    // Fetch verified outgoing caller IDs
    const verifiedCallerIds = await client.outgoingCallerIds.list({ limit: 100 });
    const callerIds: TwilioNumber[] = verifiedCallerIds.map(id => ({
      sid: id.sid,
      phoneNumber: id.phoneNumber,
    }));

    // Combine both lists and remove duplicates based on phone number
    // const allNumbers = [...twilioNumbers, ...callerIds].reduce((acc, current) => {
    const allNumbers = [...twilioNumbers].reduce((acc, current) => {
      if (!acc.find(item => item.phoneNumber === current.phoneNumber)) {
        acc.push(current);
      }
      return acc;
    }, [] as TwilioNumber[]);

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
