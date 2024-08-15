import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

// Example VAPI endpoint and headers. Adjust according to your VAPI's API specifications.
const VAPI_API_URL = 'https://api.vapi.ai/call';
const VAPI_API_KEY = process.env.VAPI_API_KEY; // Ensure this is set in your .env file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pageSize = 300, lastCreatedAt } = req.query;

  try {
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: pageSize,
        createdAtLt: lastCreatedAt
      }
    });

    console.log('Fetched call logs:', response.data); // Debugging line

    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      console.error('Error fetching call logs:', error.response ? error.response.data : error.message);
    } else {
      // Handle non-Axios errors
      console.error('Error fetching call logs:', error instanceof Error ? error.message : 'Unknown error');
    }

    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
