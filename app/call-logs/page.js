'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import CallLogsList from '@/components/CallLogsList';

const CallLogsPage = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 30;

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await axios.get('/api/get-call-logs');
        setCallLogs(response.data);
      } catch (error) {
        setError('Failed to fetch call logs');
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = callLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Call Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <CallLogsList
          logs={currentLogs}
          currentPage={currentPage}
          logsPerPage={logsPerPage}
          totalLogs={callLogs.length}
          paginate={paginate}
        />
      )}
    </div>
  );
};

export default CallLogsPage;
