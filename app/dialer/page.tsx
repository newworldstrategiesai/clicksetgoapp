// pages/dialer.tsx

import React from 'react';
import DialerComponent from '@/components/DialerComponent';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';

export default async function DialerPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Fetch the API keys from Supabase
    const { data, error } = await supabase
      .from('api_keys' as any) // Cast as 'any' to bypass type checking
      .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch API keys');
      return redirect('/signin'); // Handle this case as appropriate
    }

    const apiKey = data.eleven_labs_key;
    const twilioSid = data.twilio_sid;
    const twilioAuthToken = data.twilio_auth_token;
    const vapiKey = data.vapi_key;

    return (
      <section className="min-h-screen bg-black text-white">
        <div className="pt-[60px] p-4">
          {/* Adjust the padding-top to match the height of your navbar */}
          <DialerComponent
            userId={user.id}
            apiKey={apiKey}
            twilioSid={twilioSid}
            twilioAuthToken={twilioAuthToken}
            vapiKey={vapiKey}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
