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
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const logsPerPage = 30;

  const fetchSMSLogs = async (page: number, token: string | null = null) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/get-sms-logs', {
        params: { page, pageSize: logsPerPage, pageToken: token }
      });

      const { messages, nextPageToken, totalCount } = response.data;

      setSmsLogs(messages);
      setTotalLogs(totalCount);
      setPageToken(nextPageToken);
      setError('');
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      setError('Failed to fetch SMS logs');
      setSmsLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSMSLogs(currentPage, pageToken);
  }, [currentPage]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchSMSLogs(pageNumber, pageToken);
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
            totalLogs={totalLogs}
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
