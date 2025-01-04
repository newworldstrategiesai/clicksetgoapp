import axios, { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';

const VAPI_API_URL = 'https://api.vapi.ai/call';
const VAPI_API_KEY = process.env.VAPI_API_KEY; // Using the VAPI key from the .env file

// Utility function for date formatting
const getFormattedDate = (date: string) => moment(date).toISOString();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, timePeriod = '6', lastCreatedAt, status, page = 1, limit = 10 } = req.query;

  // Validate userId
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  const today = moment();
  let startDate;

  // Set startDate based on timePeriod query
  switch (timePeriod) {
    case '3':
      startDate = today.subtract(3, 'months').startOf('month').toISOString();
      break;
    case '6':
      startDate = today.subtract(6, 'months').startOf('month').toISOString();
      break;
    case '12':
      startDate = today.subtract(12, 'months').startOf('month').toISOString();
      break;
    default:
      startDate = today.subtract(6, 'months').startOf('month').toISOString();
  }

  try {
    // API request to fetch call data
    const response = await axios.get(VAPI_API_URL, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`, // API Key
        'Content-Type': 'application/json',
      },
      params: {
        limit,
        createdAtGe: startDate, // Filter by start date
        createdAtLt: lastCreatedAt || today.toISOString(), // Filter by end date
        status, // Filter by call status (queued, active, ended, etc.)
      },
    });

    const { data } = response;

    // Handle case where no data is returned
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No data returned for the given date range.');
      return res.status(200).json({ message: 'No data found for the selected period' });
    }

    // Process logs and add useful data
    const processedLogs = data.map((log: any) => ({
      ...log,
      customer: log.customer || { name: 'Unknown', number: 'Unknown' },
      agent: log.agent || { name: 'Unknown Agent' },
      monitor: log.monitor || {},
      createdAt: getFormattedDate(log.createdAt),
      endedAt: log.endedAt ? getFormattedDate(log.endedAt) : 'N/A',
      duration: log.duration || 0,
      callCost: log.cost || 0,
    }));

    // Pagination logic
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedLogs = processedLogs.slice(startIndex, startIndex + Number(limit));

    const totalPages = Math.ceil(processedLogs.length / Number(limit));

    res.status(200).json({
      logs: paginatedLogs,
      page: Number(page),
      totalPages,
      totalLogs: processedLogs.length,
      hasMore: Number(page) < totalPages,
    });
  } catch (error) {
    // Enhanced error handling
    if (error instanceof AxiosError) {
      console.error('Error fetching call logs:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to fetch call logs', details: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}
