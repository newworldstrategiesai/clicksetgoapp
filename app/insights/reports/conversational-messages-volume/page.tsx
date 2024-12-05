'use client';

import { useState } from 'react';

export default function ConversationalMessagesVolumePage() {
  const [dateRange, setDateRange] = useState('15/08/2024 – 21/08/2024');
  const [filters, setFilters] = useState<string[]>([]);

  return (
    <div className="min-h-screen dark:bg-black dark:text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 text-gray-400 mb-4">
          <a href="#" className="underline">
            Reports
          </a>
          <span>/</span>
          <span>Conversational messages volume</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Conversational messages volume</h1>
        <p className="text-gray-400 mb-4">
          The number of messages per conversation with your AI Agent, from any source.{' '}
          <a href="#" className="text-blue-400 underline">
            Learn more
          </a>
        </p>

        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Last updated 3 hours ago</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <label>Date range</label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-800 dark:text-white p-2 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>Filters</label>
            <button
              onClick={() => setFilters([...filters, 'New Filter'])}
              className="bg-gray-800 dark:text-white p-2 rounded-md"
            >
              Add filter
            </button>
          </div>
          <button className="bg-gray-800 dark:text-white p-2 rounded-md">Download</button>
          <button className="bg-gray-800 dark:text-white p-2 rounded-md">Print</button>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg text-center">
          {/* Mock chart or graph */}
          <div className="h-64 mb-4 bg-gray-700 rounded-lg"></div>
          <div className="flex justify-center space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={true} className="form-checkbox text-blue-500" />
              <span>Messages sent</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={true} className="form-checkbox text-pink-500" />
              <span>Customer messages received</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={true} className="form-checkbox text-gray-500" />
              <span>Compare to past</span>
            </label>
          </div>
          <div className="flex justify-center text-gray-400">
            <span className="mr-4">Previous</span>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}
