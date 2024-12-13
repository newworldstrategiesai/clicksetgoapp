import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import PersonasClient from '@/components/PersonasClient';
import axios from 'axios';

// Define Voice interface
interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

// Define API Keys interface
interface ApiKeys {
  apiKey: string;
  twilioSid: string;
  twilioAuthToken: string;
  vapiKey: string;
}

export default async function PersonasPage() {
  const supabase = createClient();
  const user = await getUser(await supabase);

  const {
    data: { session },
    error: sessionError
  } = await (await supabase).auth.getSession();

  // Check if there was an error fetching the session
  if (sessionError || !session) {
    redirect('/signin'); // Redirect to sign-in if session is invalid
    return;
  }

  if (!user) {
    redirect('/signin');
  }

  // Fetch API Keys
  let apiKeys: ApiKeys | null = null;
  try {
    const { data, error } = await (await supabase)
      .from('api_keys')
      .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch API keys:', error);
    } else {
      apiKeys = {
        apiKey: data.eleven_labs_key,
        twilioSid: data.twilio_sid,
        twilioAuthToken: data.twilio_auth_token,
        vapiKey: data.vapi_key
      };
    }
  } catch (err) {
    console.error('Error fetching API keys:', err);
  }

  // Fetch voices if API key is available
  let voices: Voice[] = [];
  if (apiKeys?.apiKey) {
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKeys.apiKey
        }
      });
      voices = response.data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  }
  // Fetch personas
  const { data: persona, error } = await (await supabase)
    .from('agents')
    .select('*')
    .eq('user_id', user.id);
  const personas = persona?.sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  if (error) {
    console.error('Error fetching personas:', error);
    return <div>Error loading personas</div>;
  }

  return (
    <PersonasClient
      initialPersonas={personas || []}
      userId={user.id}
      apiKeys={apiKeys?.apiKey || ''}
      twilioSid={apiKeys?.twilioSid || ''}
      twilioAuthToken={apiKeys?.twilioAuthToken || ''}
      vapiKey={apiKeys?.vapiKey || ''}
      voice={voices}
    />
  );
}
