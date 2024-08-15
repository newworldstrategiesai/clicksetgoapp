import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pageSize = 30, pageToken } = req.query;
  const limit = parseInt(pageSize as string, 10);

  try {
    // Fetch the messages for the current page
    const params: Record<string, any> = {
      limit,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const messagesPage = await client.messages.list(params);

    if (!messagesPage || !Array.isArray(messagesPage)) {
      throw new Error('Invalid response from Twilio API');
    }

    const formattedMessages = messagesPage.map((msg) => ({
      id: msg.sid,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      dateSent: msg.dateSent.toISOString(),
    }));

    // Twilio does not provide `nextPageToken` in the response directly
    // So we should omit this if it’s not available
    const nextPageToken = messagesPage.length === limit ? pageToken : null;

    res.status(200).json({
      messages: formattedMessages,
      nextPageToken,
      totalCount: formattedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
}
