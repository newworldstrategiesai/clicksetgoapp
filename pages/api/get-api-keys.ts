//pages/api/get-api-keys.ts
import { createClient } from '@/server'; // Import the createClient function
import { getApiKeys } from '@/utils/supabase/queries'; // Import the function to get API keys
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = await createClient(); // Create Supabase client

  try {
    const { userId } = req.query; // Get userId from the query parameters
    console.log('Received userId:', userId); // Log the userId

    if (!userId) {
      console.error('No user ID provided'); // Log error for missing userId
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch the API keys from Supabase
    const apiKeys = await getApiKeys(supabase, userId as string);
    console.log('Fetched API keys:', apiKeys); // Log the fetched API keys

    if (!apiKeys) {
      console.error('Zero API keys found for the user'); // Log if no keys found
      return res.status(404).json({ error: 'No API keys found for the user' });
    }

    res.status(200).json(apiKeys); // Return the API keys
  } catch (error) {
    // Type assertion to Error
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    console.error('Error fetching the API keys:', errorMessage); // Log the error message
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
}
