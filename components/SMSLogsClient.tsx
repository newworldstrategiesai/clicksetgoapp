'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SMSList from '@/components/SMSList';
import SMSLogModal from '@/components/SMSLogModal';
import ClipLoader from 'react-spinners/ClipLoader'; // Example loader, you can use any other loading spinner

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
  const [csvLoading, setCsvLoading] = useState(false); // CSV loading state
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SMSLog | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const logsPerPage = 30;

  // Fetch a single page of SMS logs
  const fetchSMSLogs = async (page: number, token: string | null = null) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/get-sms-logs', {
        params: { page, pageSize: logsPerPage, pageToken: token }
      });

      const { messages, nextPageToken, totalCount } = response.data;

      setSmsLogs((prevLogs) => [...prevLogs, ...messages]); // Append new logs
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

  // Fetch all pages of SMS logs before generating CSV
  const fetchAllSMSLogs = async () => {
    let allLogs: SMSLog[] = [];
    let page = 1;
    let token = null;

    setCsvLoading(true); // Start CSV loading animation

    // Fetch all pages until no nextPageToken is returned
    while (true) {
      try {
        const response = await axios.get('/api/get-sms-logs', {
          params: { page, pageSize: logsPerPage, pageToken: token }
        });

        const { messages, nextPageToken } = response.data;
        allLogs = [...allLogs, ...messages];

        if (!nextPageToken) break; // No more pages to fetch

        token = nextPageToken;
        page++;
      } catch (error) {
        console.error('Error fetching all SMS logs:', error);
        break;
      }
    }

    setCsvLoading(false); // End CSV loading animation
    return allLogs;
  };

  // Function to convert all SMS logs to CSV format and download it
  const downloadCSV = async () => {
    const allLogs = await fetchAllSMSLogs(); // Fetch all logs first

    const csvHeaders = ['ID', 'From', 'To', 'Message', 'Date Sent'].join(',');
    const csvRows = allLogs.map(log => [
      log.id || '',
      log.from || '',
      log.to || '',
      `"${log.body.replace(/"/g, '""')}"`, // Wrap message body in quotes to handle commas and escape quotes
      log.dateSent || ''
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sms_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen p-4 mt-16 max-w-full">
      <h1 className="text-xl iphone-se:text-2xl iphone-12-pro:text-3xl iphone-14-pro-max:text-4xl ipad-air:text-5xl mb-4 text-center md:text-left">SMS Logs</h1>

      {/* Download CSV Button */}
      <button
        onClick={downloadCSV}
        className={`mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg ${csvLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={csvLoading}
      >
        {csvLoading ? 'Generating CSV...' : 'Download All SMS Logs as CSV'}
      </button>

      {csvLoading && (
        <div className="flex justify-center items-center mb-4">
          <ClipLoader color="#fff" loading={csvLoading} size={50} />
        </div>
      )}

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
