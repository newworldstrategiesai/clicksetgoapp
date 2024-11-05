// pages/api/get-call-logs-by-number.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface CallLog {
  id: string;
  customer?: { number?: string };
  // ... other properties
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { number, page = '1' } = req.query;
  const vapiKey = req.headers.authorization?.split(' ')[1];

  if (!number) {
    return res.status(400).json({ error: 'Missing number parameter' });
  }

  try {
    const VAPI_API_KEY = vapiKey;
    const VAPI_CALL_URL = process.env.VAPI_CALL;

    if (!VAPI_API_KEY || !VAPI_CALL_URL) {
      return res
        .status(500)
        .json({ error: 'Server configuration error: Missing API key or URL' });
    }

    // Fetch all call logs without unsupported parameters
    const response = await axios.get(VAPI_CALL_URL, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const allLogs: CallLog[] = response.data;

    // Filter logs by customer number
    const targetNumber = number.toString().replace(/\D/g, '');
    const filteredLogs = allLogs.filter((log) => {
      const logNumber = log.customer?.number?.replace(/\D/g, '');
      return logNumber === targetNumber;
    });

    // Implement server-side pagination
    const LIMIT = 20;
    const currentPage = parseInt(page as string, 10);
    const totalLogs = filteredLogs.length;
    const totalPages = Math.ceil(totalLogs / LIMIT);

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;

    // Get the logs for the current page
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.status(200).json({
      logs: paginatedLogs,
      page: currentPage,
      totalPages,
      totalLogs,
      hasMore: currentPage < totalPages,
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('External API Error:', error.response.data);
        res.status(error.response.status).json({
          error: 'Failed to fetch call logs',
          details: error.response.data,
        });
      } else if (error.request) {
        console.error('No Response from External API:', error.request);
        res.status(500).json({ error: 'No response from external API' });
      } else {
        console.error('Error in API request setup:', error.message);
        res
          .status(500)
          .json({ error: 'Error in API request setup', details: error.message });
      }
    } else {
      console.error('Unexpected Error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}
