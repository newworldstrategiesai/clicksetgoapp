'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

interface VoiceDropdownProps {
  voices: Voice[];
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

function VoiceDropdown({ voices, selectedVoice, setSelectedVoice }: VoiceDropdownProps) {
  return (
    <div>
      <label className="block mb-2">
        <span className="block text-gray-400">Select Voice:</span>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="p-2 border rounded-lg w-full bg-gray-800 text-white max-h-40 overflow-y-auto"
        >
          {voices.length > 0 ? (
            voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name} (ID: {voice.voice_id}) - {voice.gender}, {voice.accent}
              </option>
            ))
          ) : (
            <option value="" disabled>No voices available</option>
          )}
        </select>
      </label>
    </div>
  );
}

export default function PersonaPage({ userId, apiKey }: { userId: string; apiKey: string }) {
  const [activeTab, setActiveTab] = useState('identity');
  const [agentId, setAgentId] = useState<string | null>(null);
  
  // Form State
  const [agentName, setAgentName] = useState('Chloe');
  const [companyName, setCompanyName] = useState('Ben Spins');
  const [companyDescription, setCompanyDescription] = useState('');
  const [timezone, setTimezone] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('Friendly');
  const [emojiUsage, setEmojiUsage] = useState(true);
  const [emojiLimit, setEmojiLimit] = useState('');
  const [messageLength, setMessageLength] = useState('Normal');
  const [multistepInstructions, setMultistepInstructions] = useState('Send multiple steps');
  const [askForHelp, setAskForHelp] = useState(false);
  const [noPersonalInfo, setNoPersonalInfo] = useState(false);
  const [noCompetitors, setNoCompetitors] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // Fetch available voices from Eleven Labs
  const fetchVoices = async () => {
    try {
      const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      setVoices(response.data.voices);
      if (response.data.voices.length > 0) {
        setSelectedVoice(response.data.voices[0].voice_id); // Set default voice if available
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  useEffect(() => {
    fetchVoices(); // Fetch voices on load
  }, [apiKey]);

  const handleSave = async () => {
    if (!userId) {
      alert('User ID is missing');
      return;
    }

    const agentData = {
      user_id: userId,
      agent_name: agentName,
      company_name: companyName,
      company_description: companyDescription,
      default_timezone: timezone,
      tone_of_voice: toneOfVoice,
      allow_emoji_usage: emojiUsage,
      emoji_limit: emojiLimit,
      message_length: messageLength,
      multistep_instructions: multistepInstructions,
      ask_for_help: askForHelp,
      no_personal_info: noPersonalInfo,
      no_competitors: noCompetitors,
      default_voice: selectedVoice,
    };

    let error;

    if (agentId) {
      const { error: updateError } = await supabase
        .from('agents')
        .update(agentData)
        .eq('id', agentId);

      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('agents')
        .insert(agentData)
        .select();

      if (!insertError) {
        setAgentId(data[0].id); // Save new agent ID
      }

      error = insertError;
    }

    if (error) {
      console.error('Error saving agent data:', error);
      alert('There was an error saving the agent data.');
    } else {
      alert('Agent data saved successfully!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Persona</h1>

      <div className="mb-6">
        <Link href="/customization/personas">
          <span className="bg-blue-500 text-white py-2 px-4 rounded-md">
            View All Personas
          </span>
        </Link>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('identity')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'identity'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Identity and company
          </button>
          <button
            onClick={() => setActiveTab('tone')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'tone'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Tone and style
          </button>
          <button
            onClick={() => setActiveTab('manners')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'manners'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Manners
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'identity' && (
          <IdentityAndCompany
            agentName={agentName}
            setAgentName={setAgentName}
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyDescription={companyDescription}
            setCompanyDescription={setCompanyDescription}
            timezone={timezone}
            setTimezone={setTimezone}
          />
        )}

        {activeTab === 'tone' && (
          <ToneAndStyle
            toneOfVoice={toneOfVoice}
            setToneOfVoice={setToneOfVoice}
            emojiUsage={emojiUsage}
            setEmojiUsage={setEmojiUsage}
            emojiLimit={emojiLimit}
            setEmojiLimit={setEmojiLimit}
            messageLength={messageLength}
            setMessageLength={setMessageLength}
            multistepInstructions={multistepInstructions}
            setMultistepInstructions={setMultistepInstructions}
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
        )}

        {activeTab === 'manners' && (
          <Manners
            askForHelp={askForHelp}
            setAskForHelp={setAskForHelp}
            noPersonalInfo={noPersonalInfo}
            setNoPersonalInfo={setNoPersonalInfo}
            noCompetitors={noCompetitors}
            setNoCompetitors={setNoCompetitors}
          />
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white py-2 px-4 rounded-md"
        >
          Save Persona
        </button>
      </div>
    </div>
  );
}

// Identity and Company Tab Component
function IdentityAndCompany({
  agentName,
  setAgentName,
  companyName,
  setCompanyName,
  companyDescription,
  setCompanyDescription,
  timezone,
  setTimezone
}: {
  agentName: string;
  setAgentName: (name: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  companyDescription: string;
  setCompanyDescription: (description: string) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">Agent Name</label>
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Company Description</label>
        <textarea
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          placeholder="Describe your company's products and services"
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
        <p className="mt-2 text-sm text-gray-500">
          This provides context for the AI Agent to reply to general questions about your company and its products and services.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Default Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        >
          <option value="">Time Zone</option>
          <option value="GMT">GMT</option>
          <option value="EST">EST</option>
          <option value="PST">PST</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Provides a default date and time for the AI Agent to reference when it is unable to retrieve the user's timezone to personalize conversations.
        </p>
      </div>
    </div>
  );
}

// Tone and Style Tab Component
function ToneAndStyle({
  toneOfVoice,
  setToneOfVoice,
  emojiUsage,
  setEmojiUsage,
  emojiLimit,
  setEmojiLimit,
  messageLength,
  setMessageLength,
  multistepInstructions,
  setMultistepInstructions,
  voices,
  selectedVoice,
  setSelectedVoice
}: {
  toneOfVoice: string;
  setToneOfVoice: (tone: string) => void;
  emojiUsage: boolean;
  setEmojiUsage: (usage: boolean) => void;
  emojiLimit: string;
  setEmojiLimit: (limit: string) => void;
  messageLength: string;
  setMessageLength: (length: string) => void;
  multistepInstructions: string;
  setMultistepInstructions: (instructions: string) => void;
  voices: Voice[];
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">General</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Tone of voice</label>
          <select
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          >
            <option>Friendly</option>
            <option>Professional</option>
            <option>Casual</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Allow emoji usage</label>
          <CustomSwitch checked={emojiUsage} onChange={(value) => setEmojiUsage(value)} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Limit emoji usage to these ones:</label>
          <input
            type="text"
            value={emojiLimit}
            onChange={(e) => setEmojiLimit(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          />
          <p className="mt-2 text-sm text-gray-500">
            Find and copy emojis from <a href="#" className="text-blue-400 underline">the Unicode website</a>.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Message Length</label>
          <select
            value={messageLength}
            onChange={(e) => setMessageLength(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          >
            <option>Normal</option>
            <option>Short</option>
            <option>Long</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Multistep Instructions</label>
          <select
            value={multistepInstructions}
            onChange={(e) => setMultistepInstructions(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          >
            <option>Send multiple steps</option>
            <option>Send all at once</option>
            <option>Don't send multiple steps</option>
          </select>
        </div>

        <div className="mt-8">
          <VoiceDropdown
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
        </div>
      </div>
    </div>
  );
}

// Manners Tab Component
function Manners({
  askForHelp,
  setAskForHelp,
  noPersonalInfo,
  setNoPersonalInfo,
  noCompetitors,
  setNoCompetitors
}: {
  askForHelp: boolean;
  setAskForHelp: (value: boolean) => void;
  noPersonalInfo: boolean;
  setNoPersonalInfo: (value: boolean) => void;
  noCompetitors: boolean;
  setNoCompetitors: (value: boolean) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Ask if more help is needed</h2>
          <p className="mt-1 text-sm text-gray-400">
            After attempting to resolve an inquiry, the AI Agent will ask if the customer needs more help.
          </p>
        </div>
        <CustomSwitch checked={askForHelp} onChange={(value) => setAskForHelp(value)} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Don't mention customers' personal info</h2>
          <p className="mt-1 text-sm text-gray-400">
            The AI Agent will not mention personal info, such as a customer's name or email, in conversation.
          </p>
        </div>
        <CustomSwitch checked={noPersonalInfo} onChange={(value) => setNoPersonalInfo(value)} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Don't talk about competitors</h2>
          <p className="mt-1 text-sm text-gray-400">
            The AI Agent will refrain from engaging in conversation about your competitors.
          </p>
        </div>
        <CustomSwitch checked={noCompetitors} onChange={(value) => setNoCompetitors(value)} />
      </div>
    </div>
  );
}

// CustomSwitch Component for toggling switches
function CustomSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`${
        checked ? 'bg-purple-600' : 'bg-gray-700'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </button>
  );
}