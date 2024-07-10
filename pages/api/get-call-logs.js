import axios from 'axios';

export default async function handler(req, res) {
  const VAPI_API_URL = 'https://api.vapi.ai/call';
  const VAPI_API_KEY = process.env.VAPI_API_KEY; // Ensure this is set in your .env file

  try {
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
