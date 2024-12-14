//pages/api/get-sms-logs.js
import twilio from 'twilio';

export default async function handler(req, res) {
  const { pageSize = 100, maxRecords = 1000 } = req.query;
  const limit = parseInt(pageSize);
  const maxLimit = parseInt(maxRecords);

  const accountSid = req.headers['twiliosid'];
  const authToken = req.headers['twilioauthtoken'];
  const client = twilio(accountSid, authToken);

  try {
    let allMessages = [];
    let nextPageToken = null;

    do {
    // Fetch the messages for the current page
      const params = { limit };
      if (nextPageToken) {
        params.pageToken = nextPageToken;
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

      allMessages = [...allMessages, ...formattedMessages];

      // Stop fetching if we have reached the max limit
      if (allMessages.length >= maxLimit) {
        allMessages = allMessages.slice(0, maxLimit);
        break;
      }

      nextPageToken = messagesPage.nextPageUri ? new URLSearchParams(messagesPage.nextPageUri).get('PageToken') : null;
    } while (nextPageToken);

    res.status(200).json({
      messages: allMessages,
      totalCount: allMessages.length,
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
}
