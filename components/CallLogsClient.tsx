'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SMSList from '@/components/SMSList';
import SMSLogModal from '@/components/SMSLogModal';

interface SMSLog {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

const SMSLogsClient: React.FC = () => {
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SMSLog | null>(null);
  const [totalLogs, setTotalLogs] = useState(0); // State to store total number of logs
  const logsPerPage = 30;

  const fetchSMSLogs = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/get-sms-logs', {
        params: { page, pageSize: logsPerPage }
      });

      const { messages, totalCount } = response.data;

      setSmsLogs(messages);
      setTotalLogs(totalCount); // Set the total number of logs
      setError(''); // Reset error state if successful
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      setError('Failed to fetch SMS logs');
      setSmsLogs([]); // Ensure smsLogs is set to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSMSLogs(currentPage);
  }, [currentPage]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRowClick = (log: SMSLog) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  return (
    <div className="flex flex-col h-screen p-4 mt-16 max-w-full">
      <h1 className="text-xl iphone-se:text-2xl iphone-12-pro:text-3xl iphone-14-pro-max:text-4xl ipad-air:text-5xl mb-4 text-center md:text-left">SMS Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex-grow overflow-auto">
          <SMSList
            logs={smsLogs}
            onRowClick={handleRowClick}
            currentPage={currentPage}
            logsPerPage={logsPerPage}
            totalLogs={totalLogs} // Pass the total number of logs
            paginate={paginate}
          />
        </div>
      )}
      {selectedLog && (
        <SMSLogModal log={selectedLog} onClose={closeModal} />
      )}
    </div>
  );
};

export default SMSLogsClient;
