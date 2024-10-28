'use client';

import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import SMSList from '@/components/SMSList';
import SMSLogModal from '@/components/SMSLogModal';
import ClipLoader from 'react-spinners/ClipLoader';

interface SMSLog {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

interface SMSLogResponse {
  messages: SMSLog[];
  nextPageToken: string | null;
  totalCount: number;
}

const SMSLogsClient: React.FC<{ userId: string , apiKey: string; twilioSid: string; twilioAuthToken : string; vapiKey: string  }> = 
 ({ userId, apiKey, twilioSid, twilioAuthToken, vapiKey }) => {
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);
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
      const response: AxiosResponse<SMSLogResponse> = await axios.get<SMSLogResponse>('/api/get-sms-logs', {
        params: { 
          page, 
          pageSize: logsPerPage, 
          pageToken: token, 
          userId,
        },
        headers: { // Moved credentials to headers
          'twilioSid': twilioSid,
          'twilioAuthToken': twilioAuthToken,
        }
      });

      const { messages, nextPageToken, totalCount } = response.data;

      setSmsLogs((prevLogs) => [...prevLogs, ...messages]);
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

  // Fetch all SMS logs
  const fetchAllSMSLogs = async (): Promise<SMSLog[]> => {
    let allLogs: SMSLog[] = [];
    let page = 1;
    let token: string | null = null;

    setCsvLoading(true);

    while (true) {
      try {
        const response: AxiosResponse<SMSLogResponse> = await axios.get<SMSLogResponse>('/api/get-sms-logs', {
          params: { 
            page, 
            pageSize: logsPerPage, 
            pageToken: token, 
            userId,
          },
          headers: { // Moved credentials to headers
            'twilioSid': twilioSid,
            'twilioAuthToken': twilioAuthToken,
          }
        });

        const { messages, nextPageToken } = response.data;
        allLogs = [...allLogs, ...messages];

        if (!nextPageToken) break;

        token = nextPageToken;
        page++;
      } catch (error) {
        console.error('Error fetching all SMS logs:', error);
        break;
      }
    }

    setCsvLoading(false);
    return allLogs;
  };

  const downloadCSV = async () => {
    const allLogs = await fetchAllSMSLogs();

    const csvHeaders = ['ID', 'From', 'To', 'Message', 'Date Sent'].join(',');
    const csvRows = allLogs.map(log => [
      log.id || '',
      log.from || '',
      log.to || '',
      `"${log.body.replace(/"/g, '""')}"`,
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
      <h1 className="text-xl mb-4 text-center md:text-left">SMS Logs</h1>

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
