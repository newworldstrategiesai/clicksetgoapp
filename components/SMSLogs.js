'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SMSList from '@/components/SMSList';

const SMSLogs = () => {
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 30;

  useEffect(() => {
    const fetchSMSLogs = async () => {
      try {
        const response = await axios.get('/api/get-sms-logs');
        setSmsLogs(response.data);
      } catch (error) {
        setError('Failed to fetch SMS logs');
      } finally {
        setLoading(false);
      }
    };

    fetchSMSLogs();
  }, []);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = smsLogs.slice(indexOfFirstLog, indexOfFirstLog + logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">SMS Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <SMSList
          logs={currentLogs}
          currentPage={currentPage}
          logsPerPage={logsPerPage}
          totalLogs={smsLogs.length}
          paginate={paginate}
        />
      )}
    </div>
  );
};

export default SMSLogs;