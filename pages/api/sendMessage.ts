import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || ''; // Twilio Phone Number

// Initialize Twilio Client with SID and Auth Token from environment variables
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Define the expected structure of the request body
interface SendMessageBody {
  message: string;
  to: string; // Phone number to which the message will be sent
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { message, to }: SendMessageBody = req.body; // Extract message and recipient phone number

    // Validate input
    if (!message || !to) {
      return res.status(400).json({ error: 'Message and recipient phone number are required.' });
    }

    try {
      // Send the message using the Twilio API
      const response = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: to, // The phone number to send the message to
      });

      // Respond with success
      res.status(200).json({
        message: 'Message sent successfully',
        response: response,
      });
    } catch (error) {
      console.error('Twilio error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    // Handle invalid method (only POST allowed)
    res.status(405).json({ error: 'Method not allowed' });
  }
}
