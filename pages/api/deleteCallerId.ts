// pages/api/deleteCallerId.ts
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

// Initialize Twilio client
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request method is DELETE
  if (req.method === 'DELETE') {
    const { callerIdSid } = req.query; // The SID of the Caller ID to delete

    if (!callerIdSid) {
      return res.status(400).json({ error: 'Missing caller ID SID.' });
    }

    try {
      // Delete the caller ID from Twilio
      await client.outgoingCallerIds(callerIdSid as string).remove();

      // Send success response
      res.status(204).end(); // 204 No Content
    } catch (error) {
      console.error('Error deleting caller ID:', error);
      res.status(500).json({ error: 'Failed to delete caller ID.' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
}
