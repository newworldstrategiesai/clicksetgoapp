'use client';

import { useState } from 'react';

export default function GuidancePage() {
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [availability, setAvailability] = useState('everyone');

  const handleSave = (status: 'inactive' | 'active') => {
    // Logic to handle save
    console.log({
      title,
      instruction,
      availability,
      status,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Guidance</h1>
      <p className="text-gray-700 mb-6">
        Provide instructions in natural language so your AI Agent knows how best
        to interact with your customers and reflect your organization’s
        standards.{' '}
        <a href="#" className="text-blue-600 underline">
          Learn more
        </a>
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Speaking about customer service"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Instruction
        </label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Never provide customers with our contact number"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Set availability
        </label>
        <div className="flex items-center mb-4">
          <input
            id="everyone"
            name="availability"
            type="radio"
            value="everyone"
            checked={availability === 'everyone'}
            onChange={(e) => setAvailability(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label
            htmlFor="everyone"
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            Everyone
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="rules"
            name="availability"
            type="radio"
            value="rules"
            checked={availability === 'rules'}
            onChange={(e) => setAvailability(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label
            htmlFor="rules"
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            Based on the following rules...
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleSave('inactive')}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
        >
          Save as inactive
        </button>
        <button
          onClick={() => handleSave('active')}
          className="bg-purple-600 dark:text-white py-2 px-4 rounded-md"
        >
          Save and make active
        </button>
      </div>
    </div>
  );
}
