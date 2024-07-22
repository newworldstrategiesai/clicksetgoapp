import axios from 'axios';

export default async function handler(req, res) {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Number is required' });
  }

  const VAPI_API_URL = 'https://api.vapi.ai/call';
  const VAPI_API_KEY = process.env.VAPI_API_KEY; // Ensure this is set in your .env file

  let allLogs = [];
  let lastCreatedAt = new Date().toISOString();
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await axios.get(VAPI_API_URL, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100,
          createdAtLt: lastCreatedAt
        }
      });

      const logs = response.data;
      const filteredLogs = logs.filter(log => log.customer?.number.replace(/\D/g, '') === number.replace(/\D/g, ''));
      allLogs = [...allLogs, ...filteredLogs];

      if (logs.length < 100) {
        hasMore = false;
      } else {
        lastCreatedAt = logs[logs.length - 1].createdAt;
      }
    }

    res.status(200).json(allLogs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
