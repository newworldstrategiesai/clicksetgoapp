import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { twilioSid, twilioAuthToken, elevenLabsKey, vapiKey, user_id } = req.body;

  if (!twilioSid || !twilioAuthToken || !elevenLabsKey || !vapiKey || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await supabase
      .from('api_keys')
      .upsert([
        {
          user_id,
          twilio_sid: twilioSid,
          twilio_auth_token: twilioAuthToken,
          eleven_labs_key: elevenLabsKey,
          vapi_key: vapiKey
        }
      ]);

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: 'API keys saved successfully' });
  } catch (error) {
    console.error('Error saving API keys:', error);
    return res.status(500).json({ error: 'Failed to save API keys' });
  }
}
