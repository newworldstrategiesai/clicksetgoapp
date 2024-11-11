// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import SMSLogsClient from '@/components/SMSLogsClient';

export default async function SMSLogsPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    const { data, error } = await supabase
            .from('api_keys' as any)  // Cast as 'any' to bypass type checking
            .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            console.error('Failed to fetch Eleven Labs API key');
            return redirect('/signin');  // Handle this case as appropriate
        }

        const apiKey = data.eleven_labs_key;
        const twilioSid = data.twilio_sid;
        const twilioAuthToken = data.twilio_auth_token;
        const vapiKey = data.vapi_key;

    return <SMSLogsClient userId={user.id} apiKey={apiKey} twilioSid = {twilioSid} twilioAuthToken = {twilioAuthToken} vapiKey = {vapiKey} />; // Pass userId as a prop
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
