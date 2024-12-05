'use client';

import { useState } from 'react';

export default function OffHoursDetails() {
  const [messages, setMessages] = useState([
    "Unfortunately no human agents are available at the moment.",
    "I'm sorry, it looks like our human agents are not available right now.",
  ]);

  const handleDeleteMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleChangeMessage = (index: number, newMessage: string) => {
    const newMessages = [...messages];
    newMessages[index] = newMessage;
    setMessages(newMessages);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      <button onClick={() => window.history.back()} className="text-purple-400 hover:text-purple-600 font-semibold mb-6">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-2">Off-Hours</h1>
      <p className="text-gray-400 mb-4">For when customers request a handoff outside of your hours of operation.</p>
      <p className="text-gray-500 mb-10">Last updated 2 hours ago</p>
      
      <div className="flex justify-between mb-6">
        <div className="relative">
          <select className="appearance-none bg-gray-800 border border-gray-600 dark:text-white text-sm rounded-lg p-2.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
            <option value="default">English (Default)</option>
            {/* Add more language options here if needed */}
          </select>
        </div>
        <span className="text-gray-400">Content is automatically translated from your default language (English) unless manually modified.</span>
      </div>

      <div className="bg-gray-900 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold">Text Message</h2>
        {messages.map((message, index) => (
          <div key={index} className="mt-4">
            <label className="block text-sm font-medium text-gray-400">Content</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => handleChangeMessage(index, e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 dark:text-white"
              />
              <button
                onClick={() => handleDeleteMessage(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 flex space-x-4">
          <button className="text-blue-500 hover:text-blue-700 font-medium">
            + Create variations
          </button>
          <button className="text-gray-400 hover:text-gray-200 font-medium">
            Add manually
          </button>
        </div>
      </div>
    </div>
  );
}
