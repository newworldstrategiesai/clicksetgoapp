'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OutboundCallModal from 'components/OutboundCallModal';

interface Assistant {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
}

const Agents = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Assistant | null>(null);

  const fetchAssistants = async () => {
    try {
      const response = await axios.get('/api/get-assistants');
      setAssistants(response.data);
    } catch (error) {
      setError('Failed to fetch assistants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const openModal = (agent: Assistant) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAgent(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">Agents</h1>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full dark:bg-black border border-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border-b border-gray-600 dark:text-white">Name</th>
              <th className="py-2 px-4 border-b border-gray-600 dark:text-white">Description</th>
              <th className="py-2 px-4 border-b border-gray-600 dark:text-white">Type</th>
              <th className="py-2 px-4 border-b border-gray-600 dark:text-white">Date</th>
              <th className="py-2 px-4 border-b border-gray-600 dark:text-white">Agent ID</th>
            </tr>
          </thead>
          <tbody>
            {assistants.map((assistant) => (
              <tr key={assistant.id} className="hover:bg-gray-800 cursor-pointer" onClick={() => openModal(assistant)}>
                <td className="py-2 px-4 border-b border-gray-600 dark:text-white">{assistant.name}</td>
                <td className="py-2 px-4 border-b border-gray-600 dark:text-white">{assistant.description}</td>
                <td className="py-2 px-4 border-b border-gray-600 dark:text-white">{assistant.type}</td>
                <td className="py-2 px-4 border-b border-gray-600 dark:text-white">{new Date(assistant.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-600 dark:text-white">{assistant.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedAgent && (
        <OutboundCallModal
          agentName={selectedAgent.name}
          agentId={selectedAgent.id}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Agents;
