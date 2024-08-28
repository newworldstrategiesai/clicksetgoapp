//pages/api/get-sms-logs.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  const { pageSize = 100, pageToken } = req.query;
  const limit = parseInt(pageSize);

  try {
    // Fetch the messages for the current page
    const params = {
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

    res.status(200).json({
      messages: formattedMessages,
      nextPageToken: messagesPage.nextPageUri ? new URLSearchParams(messagesPage.nextPageUri).get('PageToken') : null,
      totalCount: 120, // Adjust this number based on your typical usage
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
}
