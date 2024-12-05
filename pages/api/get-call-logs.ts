import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { CallLog } from '../../types'; // Import the common CallLog type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { userId, limit, createdAtGt, createdAtLt } = req.query;
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

  const params: Record<string, any> = {
    limit: limit ? parseInt(limit as string, 10) : 10,
  };

  // Add date filters if provided
  if (createdAtGt) {
    params.createdAtGt = createdAtGt as string;
    params.limit=null;
  }
  if (createdAtLt) {
    params.createdAtLt = createdAtLt as string;
  }

  console.log('Query Params:', params);

  // Make the request
  const response = await axios.get(VAPI_Call_URL || '', {
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
    params, // Flattened params
  });
  if(createdAtGt){
    response.data.sort((a: CallLog, b: CallLog) => {
    const dateA = a.startedAt || a.createdAt;
    const dateB = b.startedAt || b.createdAt;
    return (moment(dateA).isBefore(moment(dateB)) ? -1 : 1)
    })
    return res.status(200).json(response.data.slice(0, 10));
  }
  res.status(200).json(response.data);

} catch (error) {
  console.error('Error fetching call logs:', error);
  res.status(500).json({ error: 'Failed to fetch call logs' });
}

}