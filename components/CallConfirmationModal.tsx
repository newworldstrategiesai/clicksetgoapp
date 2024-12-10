"use client";

import React, { useState, useEffect } from 'react';

interface Agent {
  id: string;
  agent_name: string;
  role: string;
  company_name: string;
  prompt: string;
  default_voice: string;
  // Add other fields as necessary
}

interface CallConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: 'existing' | 'new';
  contactName: string;
  handleModalSubmit: () => Promise<void>;
  loading: boolean;
  newFirstName: string;
  setNewFirstName: React.Dispatch<React.SetStateAction<string>>;
  newLastName: string;
  setNewLastName: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  callReason: string;
  setCallReason: React.Dispatch<React.SetStateAction<string>>;
  firstMessage: string;
  setFirstMessage: React.Dispatch<React.SetStateAction<string>>;
  agentName: string;
  setAgentName: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  defaultAgentName: string;
  defaultRole: string;
  defaultCompanyName: string;
  agents: Agent[]; // Add agents prop
}

const CallConfirmationModal: React.FC<CallConfirmationModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  contactName,
  handleModalSubmit,
  loading,
  newFirstName,
  setNewFirstName,
  newLastName,
  setNewLastName,
  input,
  callReason,
  setCallReason,
  firstMessage,
  setFirstMessage,
  agentName,
  setAgentName,
  role,
  setRole,
  companyName,
  setCompanyName,
  prompt,
  setPrompt,
  defaultAgentName,
  defaultRole,
  defaultCompanyName,
  agents = [], // Default to empty array
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Autopopulate advanced settings with default agent settings
  useEffect(() => {
    if (isOpen && agents && agents.length > 0) {
      const matchingAgent = agents.find((agent) => agent.agent_name === agentName);
      if (matchingAgent) {
        setSelectedAgentId(matchingAgent.id);
      } else {
        setSelectedAgentId(agents[0].id);
      }
    }
  }, [isOpen, agents, agentName]);

  // Update agent details when selectedAgentId changes
  useEffect(() => {
    if (selectedAgentId) {
      const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);
      if (selectedAgent) {
        setAgentName(selectedAgent.agent_name);
        setRole(selectedAgent.role);
        setCompanyName(selectedAgent.company_name);
        setPrompt(selectedAgent.prompt);
        // Optionally, set other fields like voiceId
        // setVoiceId(selectedAgent.default_voice);
      }
    }
  }, [selectedAgentId, agents, setAgentName, setRole, setCompanyName, setPrompt]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4
       dark:bg-black bg-opacity-100
        md:bg-opacity-90 md:dark:bg-opacity-90 backdrop-blur-sm"
    >
      <div className="bg-modal dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg md:w-1/2 h-auto shadow-lg transition-transform transform overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold dark:text-white text-black mb-6 text-center">
          {modalMode === 'existing' ? `Calling ${contactName}` : 'New Contact'}
        </h2>

        {/* First Name Input */}
        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-400 text-black">First Name</label>
          <input
            type="text"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white text-black"
            required
            aria-label="First Name"
            autoFocus
          />
        </div>

        {/* Last Name Input */}
        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-400 text-black">Last Name (Optional)</label>
          <input
            type="text"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            aria-label="Last Name"
          />
        </div>

        {/* Phone Number Display */}
        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-400 text-black">Phone Number</label>
          <div className="w-full p-3dark:bg-gray-600 dark:bg-gray-00 rounded-lg border bg-gray-300 dark:bg-gray-700 border-gray-500 dark:text-white text-black">
            {input || 'Enter Number'}
          </div>
        </div>

        {/* Reason for Calling Input */}
        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-400 text-black">Reason for Calling</label>
          <input
            type="text"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
            aria-label="Reason for Calling"
          />
        </div>

        {/* First Message Input */}
        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-400 text-black">First Message (Optional)</label>
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            placeholder="Enter your first message"
            aria-label="First Message"
          />
        </div>

        {/* Advanced Settings Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center text-blue-400 hover:text-blue-300 focus:outline-none transition-colors"
            aria-expanded={showAdvancedSettings}
            aria-controls="advanced-settings"
          >
            <span className="mr-2">Advanced Settings</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                showAdvancedSettings ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Settings Fields */}
        {showAdvancedSettings && (
          <div id="advanced-settings" className="mb-6">
            {/* Agent Selection Dropdown */}
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-400 text-black">Select Agent</label>
              {agents.length > 0 ? (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  aria-label="Select Agent"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.agent_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-500">No agents available</div>
              )}
            </div>

            {/* Role Input */}
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-400 text-black">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="Role"
              />
            </div>

            {/* Company Name Input */}
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-400 text-black">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="Company Name"
              />
            </div>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block mb-1 dark:text-gray-400 text-black">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Enter your prompt"
                rows={3}
                aria-label="Prompt"
              ></textarea>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between space-x-4">
          <button
            onClick={handleModalSubmit}
            className={`w-full p-3 rounded-xl text-white transition-colors ${
              loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'
            }`}
            disabled={loading}
            aria-label="Confirm Call"
          >
            {loading ? 'Submitting...' : 'Call Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full p-3dark:bg-gray-700 dark:bg-gray-700 rounded-xl text-black dark:text-white dark:hover:bg-gray-600 transition-colors hover:bg-gray-300"
            aria-label="Cancel Call"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallConfirmationModal;
