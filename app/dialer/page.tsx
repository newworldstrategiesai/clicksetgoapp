// app/dialer/page.tsx
// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

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

    // Fetch the agent settings from Supabase
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (agentError || !agentData || agentData.length === 0) {
      console.error('Failed to fetch agent settings');
      return redirect('/signin'); // Handle agent settings error
    }

    const latestAgent = agentData[0];
    const agentName = latestAgent.agent_name || '';
    const role = latestAgent.role || '';
    const companyName = latestAgent.company_name || '';
    const prompt = latestAgent.prompt || '';
    const voiceId = latestAgent.default_voice || '';

    return (
      <section className="min-h-screen dark:bg-black dark:text-white">
        <div>
          {/* Adjust the padding-top to match the height of your navbar */}
          <DialerComponent
            userId={user.id}
            apiKey={apiKey}
            twilioSid={twilioSid}
            twilioAuthToken={twilioAuthToken}
            vapiKey={vapiKey}
            agentName={agentName}
            role={role}
            companyName={companyName}
            prompt={prompt}
            voiceId={voiceId}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
