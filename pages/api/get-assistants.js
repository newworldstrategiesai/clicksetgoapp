import axios from 'axios';

export default async function handler(req, res) {
  const VAPI_API_URL = 'https://api.vapi.ai/assistant'; // Replace with the correct VAPI endpoint
  const VAPI_API_KEY = process.env.VAPI_API_KEY;

  try {
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const assistants = response.data.map((assistant) => ({
      id: assistant.id,
      name: assistant.name,
      description: assistant.description,
      type: assistant.type,
      createdAt: assistant.createdAt,
    }));

    res.status(200).json(assistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ error: 'Failed to fetch assistants' });
  }
}
