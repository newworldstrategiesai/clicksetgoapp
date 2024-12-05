'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

// Define the type for the Persona object
interface Persona {
  id: string;
  user_id: string;
  agent_name: string;
  company_name: string;
  company_description: string;
  default_timezone: string;
  tone_of_voice: string;
  allow_emoji_usage: boolean;
  emoji_limit: string;
  message_length: string;
  multistep_instructions: string;
  ask_for_help: boolean;
  no_personal_info: boolean;
  no_competitors: boolean;
  vapi_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function PersonaDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [persona, setPersona] = useState<Persona | null>(null); // Define the type of persona state

  useEffect(() => {
    const fetchPersona = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id as string)
          .single();

        if (error) {
          console.error('Error fetching persona:', error);
        } else {
          setPersona(data as Persona);
        }
      }
    };

    fetchPersona();
  }, [id]);

  const handleSave = async () => {
    if (persona) {
      const { error } = await supabase
        .from('agents')
        .update({
          agent_name: persona.agent_name,
          company_name: persona.company_name,
          company_description: persona.company_description,
          default_timezone: persona.default_timezone,
          tone_of_voice: persona.tone_of_voice,
          allow_emoji_usage: persona.allow_emoji_usage,
          emoji_limit: persona.emoji_limit,
          message_length: persona.message_length,
          multistep_instructions: persona.multistep_instructions,
          ask_for_help: persona.ask_for_help,
          no_personal_info: persona.no_personal_info,
          no_competitors: persona.no_competitors,
        })
        .eq('id', id as string);

      if (error) {
        console.error('Error saving persona:', error);
        alert('Failed to save persona.');
      } else {
        alert('Persona saved successfully!');
      }
    }
  };

  if (!persona) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Edit Persona</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Agent Name</label>
          <input
            type="text"
            value={persona.agent_name}
            onChange={(e) => setPersona({ ...persona, agent_name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 dark:text-white rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Company Name</label>
          <input
            type="text"
            value={persona.company_name}
            onChange={(e) => setPersona({ ...persona, company_name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 dark:text-white rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Company Description</label>
          <textarea
            value={persona.company_description}
            onChange={(e) => setPersona({ ...persona, company_description: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 dark:text-white rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Default Timezone</label>
          <input
            type="text"
            value={persona.default_timezone}
            onChange={(e) => setPersona({ ...persona, default_timezone: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 dark:text-white rounded-md"
          />
        </div>

        {/* Add other fields for tone of voice, emoji usage, etc. here */}
      </div>

      <div className="mt-6">
        <button onClick={handleSave} className="bg-purple-600 dark:text-white py-2 px-4 rounded-md">
          Save Persona
        </button>
        <Link href="/customization/personas" className="text-blue-400 hover:underline ml-4">
          Back to All Personas
        </Link>
      </div>
    </div>
  );
}
