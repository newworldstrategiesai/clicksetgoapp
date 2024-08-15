import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VAPI_API_URL = 'https://api.vapi.ai/call';
  const VAPI_API_KEY = process.env.VAPI_API_KEY; // Ensure this is set in your .env file

  const { pageSize = 300, lastCreatedAt } = req.query;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const formattedStartDate = startDate.toISOString();
  const formattedEndDate = endDate.toISOString();

  try {
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: pageSize,
        createdAtLt: lastCreatedAt,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });

    const data = response.data;

    // Ensure data is an array
    if (!Array.isArray(data)) {
      throw new Error('Unexpected data format: Expected an array');
    }

    // Process data as needed
    const formattedData = data.map((call: any) => ({
      date: call.date,
      inbound: call.inbound,
      outbound: call.outbound,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
