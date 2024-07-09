import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://api.vapi.ai/call', {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const callLogs = response.data;
    res.status(200).json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
