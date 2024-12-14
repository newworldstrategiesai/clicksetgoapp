export const dynamic = 'force-dynamic';

import React from 'react';
import DialerComponent from '@/components/DialerComponent';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';

interface AgentData {
  agent_name: string;
  role: string;
  company_name: string;
  default_voice: string;
  prompt: string;
}

export default async function DialerPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Fetch API keys
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
      .eq('user_id', user.id)
      .single();

    if (apiKeyError) {
      console.error('Error fetching API keys:', apiKeyError);
    }

    const apiKey = apiKeyData?.eleven_labs_key || '';
    const twilioSid = apiKeyData?.twilio_sid || '';
    const twilioAuthToken = apiKeyData?.twilio_auth_token || '';
    const vapiKey = apiKeyData?.vapi_key || '';

    // Fetch Agent settings
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('agent_name, role, company_name, default_voice, prompt')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (agentError) {
      console.error('Error fetching agent settings:', agentError);
    }

    const agentDefaults: AgentData = {
      agent_name: '',
      role: '',
      company_name: '',
      default_voice: '',
      prompt: '',
    };

    const latestAgent = agentData && agentData.length > 0 ? agentData[0] : agentDefaults;

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
            agentName={latestAgent.agent_name}
            role={latestAgent.role}
            companyName={latestAgent.company_name}
            prompt={latestAgent.prompt}
            voiceId={latestAgent.default_voice}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
