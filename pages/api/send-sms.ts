import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

// Define the expected request body type
interface SendSmsRequest {
  callerName: string;
  smsMessage: string;
  callerNumber: string;
}

// API route handler for sending SMS
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;
  const client = twilio(accountSid, authToken);

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the necessary fields from the request body
    const { callerName, smsMessage, callerNumber }: SendSmsRequest = req.body.message.functionCall.parameters;

    // Input validation
    if (!callerName || !smsMessage || !callerNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send SMS using Twilio
    const message = await client.messages.create({
      body: `${smsMessage}`, // Include caller's name in the SMS body
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: callerNumber,
    });

    // Respond with message details
    res.status(200).json({ message: 'SMS sent successfully', messageDetails: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}