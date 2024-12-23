import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';

const VAPI_API_URL = 'https://api.vapi.ai/call';
const VAPI_API_KEY = process.env.VAPI_API_KEY; // Using the VAPI key from the .env file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, timePeriod = '6', lastCreatedAt } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  const today = moment();
  let startDate;

  // Calculate the start date based on the time period
  if (timePeriod === '3') {
    startDate = today.subtract(3, 'months').startOf('month').toISOString();
  } else if (timePeriod === '6') {
    startDate = today.subtract(6, 'months').startOf('month').toISOString();
  } else if (timePeriod === '12') {
    startDate = today.subtract(12, 'months').startOf('month').toISOString();
  } else {
    startDate = today.subtract(6, 'months').startOf('month').toISOString(); // Default to 6 months
  }

  try {
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`, // Use the VAPI API key from the .env file
        'Content-Type': 'application/json',
      },
      params: {
        limit: 100,
        createdAtGe: startDate, // Add start date for filtering
        createdAtLt: lastCreatedAt || today.toISOString(), // To limit the data up until the current date
      },
    });

    // Handle case where no data is returned
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('No data returned for the given date range.');
      return res.status(200).json({ message: 'No data found for the selected period' });
    }

    res.status(200).json(response.data); // Send the call logs to the client
  } catch (error) {
    console.error('Error fetching call logs:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
