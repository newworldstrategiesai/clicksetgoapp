'use client';

import { useState } from 'react';

export default function GreetingPage() {
  const [greetings, setGreetings] = useState([
    {
      id: 1,
      messages: [
        "Hey there! I'm an automated assistant. I'm here to help you with any questions you have.",
        "👋Hello! I'm an automated assistant.",
      ],
    },
    {
      id: 2,
      messages: [
        "How can I help you today?",
        "How can I assist you today?",
      ],
    },
  ]);

  const handleDelete = (id: number) => {
    setGreetings(greetings.filter(greeting => greeting.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Greeting</h1>
      <p className="text-gray-400 mb-6">For greeting customers at the start of the conversation.</p>
      <p className="text-gray-500 mb-10">Last updated 2 hours ago</p>
      <div className="flex justify-end mb-4">
        <div className="relative">
          <select className="appearance-none bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
            <option value="default">English (Default)</option>
            {/* Add more language options here if needed */}
          </select>
        </div>
      </div>
      
      {greetings.map((greeting, index) => (
        <div key={greeting.id} className="bg-gray-900 shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Text Message</h2>
            <button onClick={() => handleDelete(greeting.id)} className="text-gray-400 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {greeting.messages.map((message, i) => (
            <div key={i} className="mt-4">
              <label className="block text-sm font-medium text-gray-400">Content</label>
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  const newGreetings = [...greetings];
                  newGreetings[index].messages[i] = e.target.value;
                  setGreetings(newGreetings);
                }}
                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
              />
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
      ))}
    </div>
  );
}
