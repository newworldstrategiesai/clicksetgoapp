// utils/supabase/getApiKeys.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function getApiKeys(user_id: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('twilio_sid, twilio_auth_token, eleven_labs_key, vapi_key')
    .eq('user_id', user_id)
    .single();

  if (error) {
    throw new Error('Failed to fetch API keys');
  }

  return data;
}
