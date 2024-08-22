'use client';

import { useState } from 'react';

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

export default function PersonaPage() {
  const [activeTab, setActiveTab] = useState('identity');

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Persona</h1>

      {/* Tabs Navigation */}
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

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'identity' && <IdentityAndCompany />}
        {activeTab === 'tone' && <ToneAndStyle />}
        {activeTab === 'manners' && <Manners />}
      </div>
    </div>
  );
}

// Identity and Company Tab Content
function IdentityAndCompany() {
  const [agentName, setAgentName] = useState('Chloe');
  const [companyName, setCompanyName] = useState('Ben Spins');
  const [companyDescription, setCompanyDescription] = useState('');
  const [timezone, setTimezone] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Agent name
        </label>
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Company name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Company description
        </label>
        <textarea
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          placeholder="Describe your company's products and services"
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        />
        <p className="mt-2 text-sm text-gray-500">
          This provides context for the AI Agent to reply to general questions
          about your company and its products and services.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Default timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
        >
          <option value="">Time Zone</option>
          {/* Add timezone options here */}
          <option value="GMT">GMT</option>
          <option value="EST">EST</option>
          <option value="PST">PST</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Provides a default date and time for the AI Agent to reference when it
          is unable to retrieve the user's timezone to personalize conversations.
        </p>
      </div>
    </div>
  );
}

// Tone and Style Tab Content
function ToneAndStyle() {
  const [toneOfVoice, setToneOfVoice] = useState('Friendly');
  const [emojiUsage, setEmojiUsage] = useState(true);
  const [emojiLimit, setEmojiLimit] = useState('');
  const [messageLength, setMessageLength] = useState('Normal');
  const [multistepInstructions, setMultistepInstructions] = useState('Send multiple steps');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">General</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">
            Tone of voice
          </label>
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
          <label className="block text-sm font-medium text-gray-300">
            Allow emoji usage
          </label>
          <CustomSwitch
            checked={emojiUsage}
            onChange={(e) => setEmojiUsage(e)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">
            Limit emoji usage to these ones:
          </label>
          <input
            type="text"
            value={emojiLimit}
            onChange={(e) => setEmojiLimit(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          />
          <p className="mt-2 text-sm text-gray-500">
            Find and copy emojis from <a href="#" className="text-blue-400 underline">the Unicode website</a>.
            Some emojis will still be allowed if they have been chosen for styling lists (below).
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">
            Message length
          </label>
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
          <label className="block text-sm font-medium text-gray-300">
            Multistep instructions
          </label>
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
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Generate Preview</h2>
        <div className="mt-4 bg-gray-800 p-4 rounded-md">
          <p className="text-sm text-gray-400">
            Type an example message to see how it would be phrased:
          </p>
          <textarea
            placeholder="Hi there! I’m the Ben Spins chatbot. How may I help you today?"
            className="mt-2 block w-full p-2 border border-gray-700 bg-gray-900 text-white rounded-md"
          ></textarea>
          <button className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-md">
            Generate preview
          </button>
        </div>
      </div>
    </div>
  );
}

// Manners Tab Content
function Manners() {
  const [askForHelp, setAskForHelp] = useState(false);
  const [noPersonalInfo, setNoPersonalInfo] = useState(false);
  const [noCompetitors, setNoCompetitors] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Ask if more help is needed</h2>
          <p className="mt-1 text-sm text-gray-400">
            After attempting to resolve an inquiry, the AI Agent will ask if the customer needs more help.
          </p>
        </div>
        <CustomSwitch
          checked={askForHelp}
          onChange={(e) => setAskForHelp(e)}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Don't mention customers' personal info</h2>
          <p className="mt-1 text-sm text-gray-400">
            The AI Agent will not mention personal info, such as a customer's name or email, in conversation.
          </p>
        </div>
        <CustomSwitch
          checked={noPersonalInfo}
          onChange={(e) => setNoPersonalInfo(e)}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Don't talk about competitors</h2>
          <p className="mt-1 text-sm text-gray-400">
            The AI Agent will refrain from engaging in conversation about your competitors.
          </p>
        </div>
        <CustomSwitch
          checked={noCompetitors}
          onChange={(e) => setNoCompetitors(e)}
        />
      </div>
    </div>
  );
}
