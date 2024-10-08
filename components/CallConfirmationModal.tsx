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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
      <div className="bg-gray-800 p-6 rounded-lg w-full h-full md:w-1/2 md:h-auto overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {modalMode === 'existing' ? `Calling ${contactName}` : 'New Contact'}
        </h2>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">First Name:</label>
          <input
            type="text"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Last Name (Optional):</label>
          <input
            type="text"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Phone Number:</label>
          <div className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white">
            {input || 'Enter Number'}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Reason for Calling:</label>
          <input
            type="text"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">First Message (Optional):</label>
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Enter your first message"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleModalSubmit}
            className="w-full bg-blue-600 p-2 rounded text-white mr-2"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Call Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 p-2 rounded text-white ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallConfirmationModal;
