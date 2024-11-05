import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import CryptoJS from 'crypto-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, limit } = req.query;
  const vapiKey = req.headers.authorization?.split(' ')[1]; 
  

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  if (!vapiKey) {
    return res.status(401).json({ error: 'Missing vapiKey in Authorization header' });
  }

  try {
    // Hardcoded API key for testing

    const VAPI_API_KEY = vapiKey;
    const VAPI_Call_URL= process.env.VAPI_CALL;

    // Fetch all call logs
    const response = await axios.get(VAPI_Call_URL || '', {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      params: {
        limit: limit,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
}
