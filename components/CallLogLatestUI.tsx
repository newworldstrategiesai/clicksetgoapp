'use client';

import AnimatedLoader from '@/components/AminmatedLoader';
import { CallLog } from '@/types';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
interface CallLogsPage{
  user: string;
}
export const CallLogsPage = ({user}:CallLogsPage) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const userId = user
    // searchParams?.get('user') || 'd0adca44-4114-4617-ad0d-e04128a97a87';

  const fetchCallLogs = async () => {
    try {
      setLoading(true);

      const callLogsResponse = await axios.get(
        '/api/api_call-logs_pagination',
        {
          params: { page },
          headers: { Authorization: `Bearer ${userId}` }
        }
      );

      const { logs, hasMore: moreLogs } = callLogsResponse.data;
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);

      if (contactsError) {
        console.error('Error fetching contacts from Supabase:', contactsError);
        return;
      }
      const callLogsData = logs.map((log: CallLog) => {
        if (log.customer && log.customer.number) {
          const contact = contacts.find(
            (contact: any) =>
              contact.phone &&
              contact.phone.replace(/\D/g, '') ===
                log.customer?.number?.replace(/\D/g, '')
          );
          if (contact) {
            log.fullName = `${contact.first_name} ${contact.last_name}`;
          }
        }
        return log;
      });
      setCallLogs(callLogsData);
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

  useEffect(() => {
    fetchCallLogs();
  }, [page]);

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 max-w-full overflow-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 text-center md:text-left">
        Calls
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <>
          <AnimatedLoader />
        </>
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
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openModal(log)}
                  >
                    <td className="py-2 px-4 border-b">
                      {log.fullName || log.customer?.number || 'Unknown'}
                    </td>
                    <td
                      className={`py-2 px-4 border-b ${
                        log.type === 'inboundPhoneCall'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      } dark:${
                        log.type === 'inboundPhoneCall'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {moment(log.createdAt).format('DD/MM/YY hh:mm A')}
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
              } text-white`}
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
              } text-white`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No call logs found for this number.</p>
      )}

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center dark:bg-black dark:bg-opacity-70 bg-white bg-opacity-70 z-50">
          <div className="dark:bg-gray-800 p-6 w-full max-w-3xl mx-auto relative shadow-lg bg-modal rounded-2xl">
            <h2 className="text-3xl font-semibold mb-6 text-black dark:text-white">
              Call Details
            </h2>

            {selectedLog.fullName && (
              <p className="text-lg mb-4 text-gray-200">
                <strong className="taxt-gray-700 dark:text-gray-400">
                  Full Name:
                </strong>
                <Link
                  href={`/user-call-logs/${selectedLog.customer?.number || ''}?user=${userId}`}
                  legacyBehavior
                >
                  <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                    {selectedLog.fullName}
                  </a>
                </Link>
              </p>
            )}

            <p className="text-lg mb-4 text-gray-200">
              <strong className="text-gray-700 dark:text-gray-400">
                Caller:
              </strong>
              <Link
                href={`/user-call-logs/${selectedLog.customer?.number || ''}?user=${userId}`}
                legacyBehavior
              >
                <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                  {selectedLog.customer?.number || 'Unknown'}
                </a>
              </Link>
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Type:
              </strong>{' '}
              {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Started At:
              </strong>{' '}
              {selectedLog.startedAt
                ? moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')
                : 'Not connected'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Ended At:
              </strong>{' '}
              {selectedLog.endedAt
                ? moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')
                : 'Not connected'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Duration:
              </strong>{' '}
              {selectedLog.startedAt && selectedLog.endedAt
                ? moment
                    .utc(
                      moment(selectedLog.endedAt).diff(
                        moment(selectedLog.startedAt)
                      )
                    )
                    .format('HH:mm:ss')
                : 'N/A'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Assistant:
              </strong>{' '}
              {selectedLog.assistant?.name || 'Unknown'}
            </p>

            <p className="text-lg mb-6 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Summary:
              </strong>{' '}
              {selectedLog.summary || 'N/A'}
            </p>

            {selectedLog.recordingUrl && (
              <div className="mb-6">
                <strong className="taxt-gray-700 dark:text-gray-400">
                  Recording:
                </strong>
                <audio controls className="mt-2 w-full">
                  <source src={selectedLog.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <button
              onClick={closeModal}
              className="mt-4 px-6 py-2 bg-red-600 dark:text-white text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// export default CallLogsPage;
