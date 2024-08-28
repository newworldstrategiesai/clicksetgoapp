'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import CustomSwitch from '@/components/CustomSwitch'; // Assuming you have the CustomSwitch component

interface Persona {
  id: string;
  user_id: string;
  agent_name: string;
  company_name: string;
  company_description: string;
  default_timezone: string;
  tone_of_voice: string;
  allow_emoji_usage: boolean;
  emoji_limit: number;
  message_length: string;
  multistep_instructions: string;
  ask_for_help: boolean;
  no_personal_info: boolean;
  no_competitors: boolean;
  vapi_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPersonas = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('agents').select('*');
      if (error) {
        console.error('Error fetching personas:', error);
      } else {
        setPersonas(data as unknown as Persona[]); // Cast data to the correct type
      }
    };

    fetchPersonas();
  }, []);

  const openModal = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPersona(null);
  };

  const handleSave = async () => {
    if (!selectedPersona) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('agents')
      .update({
        agent_name: selectedPersona.agent_name,
        company_name: selectedPersona.company_name,
        company_description: selectedPersona.company_description,
        default_timezone: selectedPersona.default_timezone,
        tone_of_voice: selectedPersona.tone_of_voice,
        allow_emoji_usage: selectedPersona.allow_emoji_usage,
        emoji_limit: selectedPersona.emoji_limit,
        message_length: selectedPersona.message_length,
        multistep_instructions: selectedPersona.multistep_instructions,
        ask_for_help: selectedPersona.ask_for_help,
        no_personal_info: selectedPersona.no_personal_info,
        no_competitors: selectedPersona.no_competitors,
      })
      .eq('id', selectedPersona.id);

    if (error) {
      console.error('Error saving persona:', error);
      alert('There was an error saving the persona.');
    } else {
      alert('Persona saved successfully!');
      closeModal();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">All Personas</h1>
      <div className="space-y-4">
        {personas.map((persona) => (
          <div key={persona.id} className="p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold">{persona.agent_name}</h2>
            <p className="text-gray-400">{persona.company_name}</p>
            <button
              onClick={() => openModal(persona)}
              className="text-blue-400 hover:underline mt-2 inline-block"
            >
              View / Edit
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 p-6 rounded-md max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Persona</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Agent Name</label>
                <input
                  type="text"
                  value={selectedPersona.agent_name}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, agent_name: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Company Name</label>
                <input
                  type="text"
                  value={selectedPersona.company_name}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, company_name: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Company Description</label>
                <textarea
                  value={selectedPersona.company_description}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      company_description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Default Timezone</label>
                <select
                  value={selectedPersona.default_timezone}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, default_timezone: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                >
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  {/* Add more timezone options here */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Tone of Voice</label>
                <select
                  value={selectedPersona.tone_of_voice}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, tone_of_voice: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                >
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  {/* Add more tone options here */}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Allow Emoji Usage</label>
                <CustomSwitch
                  checked={selectedPersona.allow_emoji_usage}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, allow_emoji_usage: e })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Emoji Limit</label>
                <input
  type="number"
  value={selectedPersona.emoji_limit}
  onChange={(e) =>
    setSelectedPersona({ 
      ...selectedPersona, 
      emoji_limit: parseFloat(e.target.value) // Convert to number
    })
  }
  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
/>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Message Length</label>
                <select
                  value={selectedPersona.message_length}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, message_length: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                >
                  <option>Normal</option>
                  <option>Short</option>
                  <option>Long</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Multistep Instructions</label>
                <select
                  value={selectedPersona.multistep_instructions}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, multistep_instructions: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
                >
                  <option>Send multiple steps</option>
                  <option>Send all at once</option>
                  <option>Don't send multiple steps</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Ask for Help</label>
                <CustomSwitch
                  checked={selectedPersona.ask_for_help}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, ask_for_help: e })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">No Personal Info</label>
                <CustomSwitch
                  checked={selectedPersona.no_personal_info}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, no_personal_info: e })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">No Competitors</label>
                <CustomSwitch
                  checked={selectedPersona.no_competitors}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, no_competitors: e })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={closeModal} className="bg-gray-600 text-white py-2 px-4 rounded-md">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
