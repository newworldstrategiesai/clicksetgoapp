// pages/api/vapi-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { parseCookies } from 'nookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Access cookies within the request context
    const cookies = parseCookies({ req });
    const firstName = cookies.firstName || '';

    // Your existing logic here
    res.status(200).json({
      status: 'success',
      firstMessage: firstName ? `Hello ${firstName}, this Ben's AI assistant. How can I help?` : `Hello, this Ben's AI assistant. How can I help?`,
      voicemailMessage: 'You\'ve reached our voicemail. Please leave a message after the beep, and we\'ll get back to you as soon as possible.',
      endCallMessage: 'Thank you for contacting us. Have a great day!',
    });
  } catch (error) {
    console.error('Error handling webhook request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
