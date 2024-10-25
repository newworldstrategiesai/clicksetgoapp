import axios from 'axios';

export default async function handler(req, res) {
  const VAPI_API_URL = process.env.VAPI_CALL;
  const VAPI_API_KEY = process.env.VAPI_API_KEY; // Ensure this is set in your .env file
  const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json';
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

  const { pageSize = 300, lastCreatedAt, type } = req.query;

  try {
    let response;
    if (type === 'voice') {
      response = await axios.get(VAPI_API_URL, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: pageSize,
          createdAtLt: lastCreatedAt
        }
      });
    } else if (type === 'sms') {
      const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
      response = await axios.get(TWILIO_API_URL, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        params: {
          PageSize: pageSize,
          DateSentBefore: lastCreatedAt
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching ${type} logs:`, error);
    res.status(500).json({ error: `Failed to fetch ${type} logs` });
  }
}
