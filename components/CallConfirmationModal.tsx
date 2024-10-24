"use client";

import React from 'react';

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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50">
      <div className="bg-black p-6 rounded-lg w-full max-w-lg md:w-1/2 h-auto shadow-lg transition-transform transform">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {modalMode === 'existing' ? `Calling ${contactName}` : 'New Contact'}
        </h2>

        {/* First Name Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">First Name</label>
          <input
            type="text"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        {/* Last Name Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Last Name (Optional)</label>
          <input
            type="text"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Phone Number Display */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Phone Number</label>
          <div className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white">
            {input || 'Enter Number'}
          </div>
        </div>

        {/* Reason for Calling Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Reason for Calling</label>
          <input
            type="text"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        {/* First Message Input */}
        <div className="mb-6">
          <label className="block mb-1 text-gray-400">First Message (Optional)</label>
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter your first message"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between space-x-4">
          <button
            onClick={handleModalSubmit}
            className={`w-full p-3 rounded-lg text-white transition-colors ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Call Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallConfirmationModal;
