'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams, useSearchParams } from 'next/navigation';
import CallLogModal from 'components/CallLogModal'; // Adjust the path based on your project structure

interface CallLog {
  id: string;
  customer?: { number: string };
  type: string;
  status: string;
  startedAt: string;
  endedAt: string;
  duration: string;
  assistant?: { name: string };
  summary?: string;
  recordingUrl?: string;
  fullName?: string;
  createdAt: string;
}

const UserCallLogs: React.FC = () => {
  const { number: encodedNumber } = useParams() as { number: string };
  const number = decodeURIComponent(encodedNumber);
  const searchParams = useSearchParams();
  const vapiKey = searchParams ? searchParams.get('vK') : null;
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callerName, setCallerName] = useState<string>('Unknown Caller');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!number) {
      setError('No phone number provided');
      setLoading(false);
      return;
    }

    const fetchCallLogs = async () => {
      try {
        setLoading(true);

        const [callLogsResponse, contactsResponse] = await Promise.all([
          axios.get('/api/get-call-logs-by-number', { params: { number, page },
          headers: { 'Authorization': `Bearer ${vapiKey}` }
          }),
          axios.get('/api/contacts'),
        ]);

        const contacts = contactsResponse.data;
        const contact = contacts.find(
          (contact: any) =>
            contact.phone &&
            contact.phone.replace(/\D/g, '') === number.replace(/\D/g, '')
        );

        setCallerName(
          contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Caller'
        );

        const { logs, hasMore: moreLogs } = callLogsResponse.data;
        setCallLogs(logs);
        setHasMore(moreLogs);
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data || error.message);
          setError(
            `Failed to fetch call logs: ${error.response?.statusText || error.message}`
          );
        } else {
          console.error('Unexpected Error:', error);
          setError('An unexpected error occurred while fetching call logs.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, [number, page, vapiKey]);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="p-4 mt-16 max-w-full overflow-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 text-center md:text-left">
        Call Logs for {callerName}
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : callLogs.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table
              className="min-w-full border-separate"
              style={{ borderSpacing: '0 0.5em' }}
            >
              <thead className="bg-transparent">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Caller</th>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Time</th>
                  <th className="py-2 px-4 border-b text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-700 cursor-pointer"
                    onClick={() => openModal(log)}
                  >
                    <td className="py-2 px-4 border-b">
                      {log.fullName || log.customer?.number || 'Unknown'}
                    </td>
                    <td
                      className={`py-2 px-4 border-b ${
                        log.type === 'inboundPhoneCall'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {moment(log.startedAt).format('MM/DD/YY hh:mm A')}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {moment
                        .utc(moment(log.endedAt).diff(moment(log.startedAt)))
                        .format('HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={goToPreviousPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={goToNextPage}
              disabled={!hasMore}
              className={`px-4 py-2 rounded ${
                !hasMore
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No call logs found for this number.</p>
      )}
      {isModalOpen && selectedLog && (
        <CallLogModal log={selectedLog} onClose={closeModal} />
      )}
    </div>
  );
};

export default UserCallLogs;
