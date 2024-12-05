"use client";

import React, { useState, useEffect } from 'react';

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
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Autopopulate advanced settings with default agent settings
  useEffect(() => {
    if (!agentName) {
      setAgentName(defaultAgentName);
    }
    if (!role) {
      setRole(defaultRole);
    }
    if (!companyName) {
      setCompanyName(defaultCompanyName);
    }
    // Note: Avoid setting prompt if it's already set
    if (!prompt) {
      setPrompt('');
    }
  }, [
    defaultAgentName,
    defaultRole,
    defaultCompanyName,
    agentName,
    role,
    companyName,
    prompt,
    setAgentName,
    setRole,
    setCompanyName,
    setPrompt,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center dark:bg-black bg-opacity-90 z-50 px-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg md:w-1/2 h-auto shadow-lg transition-transform transform">
        <h2 className="text-2xl font-bold dark:text-white mb-6 text-center">
          {modalMode === 'existing' ? `Calling ${contactName}` : 'New Contact'}
        </h2>

        {/* First Name Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">First Name</label>
          <input
            type="text"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
            aria-label="First Name"
          />
        </div>

        {/* Last Name Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">
            Last Name (Optional)
          </label>
          <input
            type="text"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            aria-label="Last Name"
          />
        </div>

        {/* Phone Number Display */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Phone Number</label>
          <div className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 dark:text-white">
            {input || 'Enter Number'}
          </div>
        </div>

        {/* Reason for Calling Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">
            Reason for Calling
          </label>
          <input
            type="text"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
            aria-label="Reason for Calling"
          />
        </div>

        {/* First Message Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">
            First Message (Optional)
          </label>
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Advanced Settings Fields */}
        {showAdvancedSettings && (
          <div id="advanced-settings" className="mb-6">
            {/* Agent Name Input */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-400">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="Agent Name"
              />
            </div>

            {/* Role Input */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-400">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="Role"
              />
            </div>

            {/* Company Name Input */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-400">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
                aria-label="Company Name"
              />
            </div>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-400">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 dark:text-white"
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
            className={`w-full p-3 rounded-lg dark:text-white transition-colors ${
              loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'
            }`}
            disabled={loading}
            aria-label="Confirm Call"
          >
            {loading ? 'Submitting...' : 'Call Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-700 rounded-lg dark:text-white hover:bg-gray-600 transition-colors"
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
