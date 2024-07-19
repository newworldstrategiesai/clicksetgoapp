"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-white">Agents</h1>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full bg-black border border-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border-b border-gray-600 text-white">Name</th>
              <th className="py-2 px-4 border-b border-gray-600 text-white">Description</th>
              <th className="py-2 px-4 border-b border-gray-600 text-white">Type</th>
              <th className="py-2 px-4 border-b border-gray-600 text-white">Date</th>
              <th className="py-2 px-4 border-b border-gray-600 text-white">Agent ID</th>
            </tr>
          </thead>
          <tbody>
            {assistants.map((assistant) => (
              <tr key={assistant.id} className="hover:bg-gray-800">
                <td className="py-2 px-4 border-b border-gray-600 text-white">{assistant.name}</td>
                <td className="py-2 px-4 border-b border-gray-600 text-white">{assistant.description}</td>
                <td className="py-2 px-4 border-b border-gray-600 text-white">{assistant.type}</td>
                <td className="py-2 px-4 border-b border-gray-600 text-white">{new Date(assistant.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-600 text-white">{assistant.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Agents;
