// pages/overview.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const Overview = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const callLogsResponse = await axios.get('/api/get-call-logs');
        setCallLogs(callLogsResponse.data);
      } catch (error) {
        setError('Failed to fetch call logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Overview</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Call Logs</h2>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4 border-b">Caller</th>
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Type</th>
                      <th className="py-2 px-4 border-b">Status</th>
                      <th className="py-2 px-4 border-b">Started At</th>
                      <th className="py-2 px-4 border-b">Ended At</th>
                      <th className="py-2 px-4 border-b">Duration</th>
                      <th className="py-2 px-4 border-b">Assistant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">{log.customer?.number || 'Unknown'}</td>
                        <td className="py-2 px-4 border-b">{log.id}</td>
                        <td className="py-2 px-4 border-b">{log.type}</td>
                        <td className="py-2 px-4 border-b">{log.status}</td>
                        <td className="py-2 px-4 border-b">{log.startedAt}</td>
                        <td className="py-2 px-4 border-b">{log.endedAt}</td>
                        <td className="py-2 px-4 border-b">{log.duration} seconds</td>
                        <td className="py-2 px-4 border-b">{log.assistant?.name || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Overview;
