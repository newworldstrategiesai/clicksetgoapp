'use client';

import { useState, useEffect, useCallback } from 'react';
// import { createClient } from '@/server';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import CustomSwitch from '@/components/CustomSwitch';
import VoiceDropdown from '@/components/VoiceDropdown';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient'; // Ensure this is the correct path
import { ListApiKeysResponse } from 'resend';

// Define interfaces
interface Persona {
  id: string;
  user_id: string;
  agent_name: string;
  company_name: string;
  company_description: string;
  role: string;
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
  default_voice: string;
}

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

interface PersonasClientProps {
  initialPersonas: Persona[];
  userId: string;
  apiKeys?: string;
  twilioSid?: string;
  twilioAuthToken?: string;
  vapiKey?: string;
  voice?: Voice[];
}

export default function PersonasClient({
  initialPersonas,
  userId,
  apiKeys = '',
  twilioSid = '',
  twilioAuthToken = '',
  vapiKey = '',
  voice = []
}: PersonasClientProps) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voices, setVoices] = useState<Voice[]>(voice);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    selectedPersona?.default_voice || voice[0]?.voice_id || ''
  );
  const [apiKey, setApiKey] = useState<string>(apiKeys);
  const openModal = (persona: Persona) => {
    setSelectedPersona(persona);
    setSelectedVoice(persona.default_voice || voices[0]?.voice_id || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPersona(null);
  };

  const handleSave = async () => {
    if (!selectedPersona) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from('agents')
      .update({
        agent_name: selectedPersona.agent_name,
        company_name: selectedPersona.company_name,
        company_description: selectedPersona.company_description,
        role: selectedPersona.role,
        // default_timezone: selectedPersona.default_timezone,
        tone_of_voice: selectedPersona.tone_of_voice,
        allow_emoji_usage: selectedPersona.allow_emoji_usage,
        emoji_limit: selectedPersona.emoji_limit,
        message_length: selectedPersona.message_length,
        multistep_instructions: selectedPersona.multistep_instructions,
        ask_for_help: selectedPersona.ask_for_help,
        no_personal_info: selectedPersona.no_personal_info,
        no_competitors: selectedPersona.no_competitors,
        default_voice: selectedVoice,

      })
      .eq('id', selectedPersona.id);

    if (error) {
      console.error('Error saving persona:', error);
      toast.error('There was an error saving the persona.');
    } else {
      setPersonas(
        personas.map((p) =>
          p.id === selectedPersona.id
            ? { ...p, default_voice: selectedVoice }
            : p
        )
      );
      toast.success('Persona Updated successfully!');
      closeModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      {/* <ToastContainer
        position="top-right"
        autoClose={3000} // Adjust timing as desired
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }} // Ensure it overlays content without shifting it
      /> */}
      <h1 className="text-5xl font-bold mb-6">All Personas</h1>
      {/* <div className="space-y-4">
        <div className="px-4 flex items-center justify-between w-full">
          <p className="text-xl font-semibold text-gray-900 dark:text-white w-1/8">
            Name
          </p>
          <p className="text-xl text-center font-semibold text-gray-900 dark:text-white w-2/6">
            Company
          </p>
          <p className="text-xl text-center font-semibold text-gray-900 dark:text-white w-1/4">
            Role
          </p>
          <p className="text-xl text-center font-semibold text-gray-900 dark:text-white w-1/4">
            Tone
          </p>
          <p className="text-xl text-center font-semibold text-gray-900 dark:text-white">
            Edit
          </p>
        </div>
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="p-4 bg-gray-200 dark:bg-gray-800 rounded-md"
          >
            <div className="px-2 flex items-center justify-between w-full">
              <p className="text-l font-semibold text-gray-900 dark:text-white w-1/8">
                {persona.agent_name}
              </p>
              <p className="text-l text-center font-semibold text-gray-900 dark:text-white w-2/6">
                {persona.company_name}
              </p>
              <p className="text-l text-center font-semibold text-gray-900 dark:text-white w-1/4">
                {persona.role}
              </p>
              <p className="text-l text-center font-semibold text-gray-900 dark:text-white w-1/4">
                {persona.tone_of_voice}
              </p>
              <button
                onClick={() => openModal(persona)}
                className="text-gray-900 dark:text-white hover:text-blue-300 ml-2"
              >
                &#x22EE;
              </button>
            </div>
          </div>
        ))}
      </div> */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-xl font-semibold text-gray-900 dark:text-white text-left w-1/6 border border-gray-300 dark:border-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-xl font-semibold text-gray-900 dark:text-white text-center w-1/4 border border-gray-300 dark:border-gray-600">
                Company
              </th>
              <th className="px-4 py-2 text-xl font-semibold text-gray-900 dark:text-white text-center w-1/5 border border-gray-300 dark:border-gray-600">
                Role
              </th>
              <th className="px-4 py-2 text-xl font-semibold text-gray-900 dark:text-white text-center w-1/4 border border-gray-300 dark:border-gray-600">
                Tone
              </th>
              <th className="px-4 py-2 text-xl font-semibold text-gray-900 dark:text-white text-center border border-gray-300 dark:border-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {personas.map((persona) => (
              <tr key={persona.id} className="bg-gray-200 dark:bg-gray-800">
                <td className="px-4 py-2 text-l font-semibold text-gray-900 dark:text-white text-left border border-gray-300 dark:border-gray-600">
                  {persona.agent_name}
                </td>
                <td className="px-4 py-2 text-l font-semibold text-gray-900 dark:text-white text-center border border-gray-300 dark:border-gray-600">
                  {persona.company_name}
                </td>
                <td className="px-4 py-2 text-l font-semibold text-gray-900 dark:text-white text-center border border-gray-300 dark:border-gray-600">
                  {persona.role}
                </td>
                <td className="px-4 py-2 text-l font-semibold text-gray-900 dark:text-white text-center border border-gray-300 dark:border-gray-600">
                  {persona.tone_of_voice}
                </td>
                <td className="px-4 py-2 text-center border border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => openModal(persona)}
                    className="text-gray-900 dark:text-white hover:bg-blue-300 px-3 py-2 rounded-xl hover:text-white"
                  >
                    {/* &#x22EE; */}
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black bg-opacity-75 dark:bg-opacity-80 backdrop-blur-sm">
          <div className="bg-modal dark:bg-gray-900 p-6 rounded-md max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-300">
              Edit Persona
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={selectedPersona.agent_name}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      agent_name: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Company Name
                </label>
                <input
                  type="text"
                  value={selectedPersona.company_name}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      company_name: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Agent Role
                </label>
                <input
                  type="text"
                  value={selectedPersona.role}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      role: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Agent Voice</label>
                <VoiceDropdown
                  voices={voices}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Company Description
                </label>
                <textarea
                  value={selectedPersona.company_description}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      company_description: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Default Timezone
                </label>
                <select
                  value={selectedPersona.default_timezone}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      default_timezone: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Tone of Voice
                </label>
                <select
                  value={selectedPersona.tone_of_voice}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      tone_of_voice: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  {/* Add more tone options here */}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Allow Emoji Usage
                </label>
                <CustomSwitch
                  checked={selectedPersona.allow_emoji_usage}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      allow_emoji_usage: e
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Emoji Limit
                </label>
                <input
                  type="number"
                  value={selectedPersona.emoji_limit}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      emoji_limit: parseFloat(e.target.value) // Convert to number
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Message Length
                </label>
                <select
                  value={selectedPersona.message_length}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      message_length: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Normal</option>
                  <option>Short</option>
                  <option>Long</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Multistep Instructions
                </label>
                <select
                  value={selectedPersona.multistep_instructions}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      multistep_instructions: e.target.value
                    })
                  }
                  className="mt-1 block w-full p-2 border border-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Send multiple steps</option>
                  <option>Send all at once</option>
                  <option>Don't send multiple steps</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  Ask for Help
                </label>
                <CustomSwitch
                  checked={selectedPersona.ask_for_help}
                  onChange={(e) =>
                    setSelectedPersona({ ...selectedPersona, ask_for_help: e })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  No Personal Info
                </label>
                <CustomSwitch
                  checked={selectedPersona.no_personal_info}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      no_personal_info: e
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black dark:text-gray-400">
                  No Competitors
                </label>
                <CustomSwitch
                  checked={selectedPersona.no_competitors}
                  onChange={(e) =>
                    setSelectedPersona({
                      ...selectedPersona,
                      no_competitors: e
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-400 dark:bg-gray-700 dark:text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 dark:bg-blue-700 dark:text-white py-2 px-4 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
