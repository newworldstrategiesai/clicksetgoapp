'use client';

import { useState } from 'react';
import { Switch } from "@/components/ui/switch";

export default function HandoffsPage() {
  const [activeTab, setActiveTab] = useState('handoffs');

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Handoffs</h1>
      <p className="text-gray-400 mb-6">
        Provide your AI Agent with information on when and how to escalate to a human agent when needed.
      </p>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('handoffs')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'handoffs'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Handoffs
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'integrations'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('off-hours')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
              activeTab === 'off-hours'
                ? 'text-white border-white'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            Off hours
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'handoffs' && <Handoffs />}
        {activeTab === 'integrations' && <Integrations />}
        {activeTab === 'off-hours' && <OffHours />}
      </div>
    </div>
  );
}

function Handoffs() {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden border border-gray-700 rounded-lg">
        <div className="flex justify-between items-center bg-gray-800 p-4">
          <div>
            <h2 className="text-lg font-semibold">Handoff</h2>
            <p className="text-gray-400">For when a customer needs help from your human support team.</p>
          </div>
          <Switch checked={true} />
        </div>
        <div className="flex justify-between items-center bg-gray-900 p-4">
          <span className="text-gray-400">Availability</span>
          <span>Everyone</span>
        </div>
        <div className="flex justify-between items-center bg-gray-900 p-4">
          <span className="text-gray-400">Last Edited</span>
          <span>Aug 21, 2024</span>
        </div>
      </div>
    </div>
  );
}

function Integrations() {
  const integrations = [
    { id: 1, name: 'Default Email Handoff', description: 'Automate creation of support tickets via email for inquiries unresolved by the AI Agent.', enabled: false },
    { id: 2, name: 'Zendesk Chat', description: 'Enable handoff to a human agent on Zendesk Chat', enabled: false },
    { id: 3, name: 'Zendesk Messaging', description: 'Adds a new block that allows you to seamlessly send hand offs to Zendesk Social Messaging', enabled: false },
    { id: 4, name: 'Salesforce Chat', description: 'Enable handoff to a human agent on Salesforce Chat', enabled: false },
    { id: 5, name: 'Salesforce', description: 'Salesforce CRM actions', enabled: false },
    { id: 6, name: 'Zendesk Ticketing', description: 'The Zendesk Ticketing App creates a new ticket in Zendesk with the inputs provided', enabled: false },
  ];

  return (
    <div className="space-y-6">
      {integrations.map((integration) => (
        <div key={integration.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
          <div>
            <h3 className="font-semibold">{integration.name}</h3>
            <p className="text-gray-400">{integration.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Switch checked={integration.enabled} />
            <button className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg hover:text-white">Configure</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function OffHours() {
  return (
    <div className="space-y-8">
      <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Off-Hours</h3>
          <p className="text-gray-400">For when customers request a handoff outside of your hours of operation.</p>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Error Fallback</h3>
          <p className="text-gray-400">For when an error occurs during a handoff flow or HTTP request.</p>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
