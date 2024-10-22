'use client';

import { useState } from 'react';

export default function AutomatedResolutionPage() {
  const [dateRange, setDateRange] = useState('15/08/2024 – 21/08/2024');
  const [rollUp, setRollUp] = useState('Daily');
  const [filters, setFilters] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 text-gray-400 mb-4">
          <a href="#" className="underline">
            Reports
          </a>
          <span>/</span>
          <span>Automated resolution rate</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Automated resolution rate</h1>
        <p className="text-gray-400 mb-4">
          An analysis of how many conversations your AI Agent resolved in a way that was accurate, relevant, and safe.{' '}
          <a href="#" className="text-blue-400 underline">
            Learn more
          </a>
        </p>

        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Last updated 2 hours ago</span>
            <span>•</span>
            <span>24 hour cycle</span>
            <span>•</span>
            <a href="#" className="text-blue-400 underline">
              0 conversations
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <label>Date range</label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>Roll up</label>
            <select
              value={rollUp}
              onChange={(e) => setRollUp(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-md"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label>Filters</label>
            <button
              onClick={() => setFilters([...filters, 'New Filter'])}
              className="bg-gray-800 text-white p-2 rounded-md"
            >
              Add filter
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3v18h18M9 9l3-3 3 3m0 6l-3 3-3-3"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No conversations found</h2>
          <p className="text-gray-400 mb-4">
            There were no conversations in your sample that met your search criteria.
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
