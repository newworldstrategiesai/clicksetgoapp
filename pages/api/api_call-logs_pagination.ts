//pages/api/api-call-logs_pagination.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabaseServer } from '@/utils/supabaseServerClient';

interface CallLog {
  id: string;
  customer?: { number?: string };
  // ... other properties
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1' } = req.query;
  const userId = req.headers.authorization?.split(' ')[1];

  try {
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user token' });
    }

    // Fetch the API key from the database
    const { data: apiKeysData, error } = await supabaseServer
      .from('api_keys')
      .select('vapi_key')
      .eq('user_id', userId)
      .single();

    if (error || !apiKeysData?.vapi_key) {
      return res.status(500).json({ error: 'Failed to fetch API key' });
    }

    const VAPI_API_KEY = apiKeysData.vapi_key;
    const VAPI_CALL_URL = process.env.VAPI_CALL;

    if (!VAPI_API_KEY || !VAPI_CALL_URL) {
      return res.status(500).json({ error: 'Server configuration error: Missing API key or URL' });
    }

    // Fetch all call logs
    const response = await axios.get(VAPI_CALL_URL, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const allLogs: CallLog[] = response.data;

    // Implement server-side pagination
    const LIMIT = 10; // Display 10 logs per page
    const currentPage = parseInt(page as string, 10);
    const totalLogs = allLogs.length;
    const totalPages = Math.ceil(totalLogs / LIMIT);

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;

    // Get the logs for the current page
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

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
        res.status(500).json({ error: 'Error in API request setup', details: error.message });
      }
    } else {
      console.error('Unexpected Error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}
