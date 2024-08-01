import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  try {
    // Fetch the messages for the last 30 days
    const messagesPage = await client.messages.list({
      dateSentAfter: thirtyDaysAgo, // Pass the Date object directly
      limit: 1000, // Adjust limit if needed
    });

    if (!messagesPage || !Array.isArray(messagesPage)) {
      throw new Error('Invalid response from Twilio API');
    }

    const formattedMessages = messagesPage.map((msg) => ({
      id: msg.sid,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      dateSent: msg.dateSent.toISOString(), // Ensure date is in ISO format
      direction: msg.direction, // Assuming this is available in the response
    }));

    res.status(200).json({
      messages: formattedMessages,
      totalCount: formattedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
}
