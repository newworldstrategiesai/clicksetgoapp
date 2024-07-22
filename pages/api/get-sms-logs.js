import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  const { page = 1, pageSize = 30 } = req.query;
  const limit = parseInt(pageSize);
  const offset = (page - 1) * limit;

  try {
    // Fetch the messages for the current page
    const messages = await client.messages.list({
      limit,
      offset,
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.sid,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      dateSent: msg.dateSent.toISOString(),
    }));

    // Set a high total count for simplicity
    const totalCount = 120; // Adjust this number based on your typical usage

    res.status(200).json({
      messages: formattedMessages,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
}
