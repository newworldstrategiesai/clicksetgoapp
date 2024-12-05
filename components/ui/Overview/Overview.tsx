"use client"; // Add this line at the top

import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { DateTime } from 'luxon';
import 'chartjs-adapter-luxon';

const Overview = () => {
  const dummyLineData = {
    datasets: [
      {
        label: 'Number of Calls',
        data: [
          { x: DateTime.fromISO('2024-07-01').toJSDate(), y: 30 },
          { x: DateTime.fromISO('2024-07-02').toJSDate(), y: 20 },
          { x: DateTime.fromISO('2024-07-03').toJSDate(), y: 50 },
          { x: DateTime.fromISO('2024-07-04').toJSDate(), y: 10 },
          { x: DateTime.fromISO('2024-07-05').toJSDate(), y: 40 },
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const dummySMSData = {
    datasets: [
      {
        label: 'Number of Text Messages',
        data: [
          { x: DateTime.fromISO('2024-07-01').toJSDate(), y: 15 },
          { x: DateTime.fromISO('2024-07-02').toJSDate(), y: 30 },
          { x: DateTime.fromISO('2024-07-03').toJSDate(), y: 25 },
          { x: DateTime.fromISO('2024-07-04').toJSDate(), y: 35 },
          { x: DateTime.fromISO('2024-07-05').toJSDate(), y: 20 },
        ],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  const dummyDurationData = {
    datasets: [
      {
        label: 'Total Minutes',
        data: [
          { x: DateTime.fromISO('2024-07-01').toJSDate(), y: 60 },
          { x: DateTime.fromISO('2024-07-02').toJSDate(), y: 45 },
          { x: DateTime.fromISO('2024-07-03').toJSDate(), y: 80 },
          { x: DateTime.fromISO('2024-07-04').toJSDate(), y: 55 },
          { x: DateTime.fromISO('2024-07-05').toJSDate(), y: 70 },
        ],
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        fill: true,
      },
    ],
  };

  const dummyReasonData = {
    labels: ['Busy', 'No Answer', 'Completed', 'Disconnected', 'Other'],
    datasets: [
      {
        label: 'Reason Call Ended',
        data: [10, 15, 30, 5, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: any = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd MMM yyyy',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
  };

  return (
    <div className="flex h-screen dark:bg-black dark:text-white">
      <aside className="w-64 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">VAPI</span>
        </div>
        <nav className="mt-4">
          <ul>
            <li className="mb-2">
              <a href="/overview" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Overview</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/assistants" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Assistants</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/phone-numbers" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Phone Numbers</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/files" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Files</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/tools" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Tools</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/squads" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Squads</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/voice-library" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Voice Library</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="/call-logs" className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700">
                <span className="ml-2">Call Logs</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Number of Calls</h2>
            <Line data={dummyLineData} options={chartOptions} />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Number of Text Messages</h2>
            <Line data={dummySMSData} options={chartOptions} />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Total Minutes</h2>
            <Line data={dummyDurationData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Overview;
