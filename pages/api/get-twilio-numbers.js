//pages/api/get-twilio-numbers
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    res.status(500).json({ message: 'Twilio credentials are not set' });
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
    const twilioNumbers = incomingPhoneNumbers.map(number => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
    }));

    res.status(200).json(twilioNumbers);
  } catch (error) {
    console.error('Error fetching Twilio numbers:', error);
    res.status(500).json({ message: 'Error fetching Twilio numbers', error: error.message });
  }
}
