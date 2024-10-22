import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    // Hardcoded API key for testing
    const VAPI_API_KEY = '431bb6dd-6ec1-401d-ae1f-baa3c09322d7';
    const VAPI_Call_URL= process.env.VAPI_CALL;
    // Fetch all call logs
    const response = await axios.get(VAPI_Call_URL || '', {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
