// components/LiveCallMonitorUI.tsx

'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { CallLog, Monitor, Message } from '@/types'; // Ensure Monitor and Message are imported
import AnimatedLoader from '@/components/AminmatedLoader';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';
import moment from 'moment';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming cn is a utility for classNames
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/custom/button';

// Define the props interface
interface LiveCallMonitorPageProps {
  userId: string;
}

// Type Guard to check if CallLog has monitor
const hasMonitor = (log: CallLog): log is CallLog & { monitor: Monitor } => {
  return log.monitor !== undefined && log.monitor.listenUrl !== '';
};

export const LiveCallMonitorPage: React.FC<LiveCallMonitorPageProps> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Fetch call logs
  const fetchCallLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const callLogsResponse = await axios.get('/api/api_call-logs_pagination', {
        params: { page },
        headers: { Authorization: `Bearer ${userId}` },
      });

      const { logs, hasMore: moreLogs } = callLogsResponse.data;
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);

      if (contactsError) {
        console.error('Error fetching contacts from Supabase:', contactsError);
        setError('Failed to fetch contacts.');
        return;
      }

      const callLogsData = logs.map((log: CallLog) => {
        if (log.customer && log.customer.number) {
          const contact = contacts.find(
            (contact: any) =>
              contact.phone &&
              contact.phone.replace(/\D/g, '') === log.customer?.number?.replace(/\D/g, '')
          );
          if (contact) {
            log.fullName = `${contact.first_name} ${contact.last_name}`;
          }
        }
        return log;
      });

      setCallLogs((prevLogs) => [...prevLogs, ...callLogsData]);
      setHasMore(moreLogs);
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      setError('Failed to load call logs.');
    } finally {
      setLoading(false);
    }
  }, [page, userId]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

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

  // Start listening to the live call using the listenUrl
  const handleStartListening = (callId: string) => {
    const selectedCall = callLogs.find((call) => call.id === callId);
    if (selectedCall && hasMonitor(selectedCall)) {
      const audio = new Audio(selectedCall.monitor.listenUrl);
      audio.play();
      audio.onended = () => {
        console.log('Call has ended');
      };
    } else {
      console.error('No listen URL found for this call');
    }
  };

  // Group messages by date
  const currentMessage = selectedLog?.messages?.reduce(
    (acc: Record<string, Message[]>, obj: Message) => {
      const key = moment(obj.dateSent).format('D MMM, YYYY');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    },
    {}
  );

  return (
    <div className="p-4 max-w-full overflow-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 text-center md:text-left">
        Live Call Monitor
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading && page === 1 ? (
        <AnimatedLoader />
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
                        log.type === 'inboundPhoneCall' ? 'text-yellow-600' : 'text-green-600'
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
                page === 1 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={goToNextPage}
              disabled={!hasMore}
              className={`px-4 py-2 rounded ${
                !hasMore ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No call logs found for this user.</p>
      )}

      {/* Modal with Call Details */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center dark:bg-black dark:bg-opacity-70 bg-white bg-opacity-70 z-50">
          <div className="dark:bg-gray-800 p-6 w-full max-w-3xl mx-auto relative shadow-lg bg-modal rounded-2xl">
            <h2 className="text-3xl font-semibold mb-6 text-black dark:text-white">
              Call Details
            </h2>

            <p className="text-lg mb-4 text-gray-200">
              <strong>Caller: </strong>{' '}
              {selectedLog.fullName || selectedLog.customer?.number || 'Unknown'}
            </p>
            <p className="text-lg mb-4 text-gray-200">
              <strong>Started At: </strong>{' '}
              {selectedLog.startedAt
                ? moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')
                : 'N/A'}
            </p>
            <p className="text-lg mb-4 text-gray-200">
              <strong>Duration: </strong>{' '}
              {selectedLog.startedAt && selectedLog.endedAt
                ? moment
                    .utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt)))
                    .format('HH:mm:ss')
                : 'N/A'}
            </p>

            {hasMonitor(selectedLog) && selectedLog.monitor.listenUrl && (
              <button
                className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                onClick={() => handleStartListening(selectedLog.id)}
              >
                Listen to Live Call
              </button>
            )}

            {/* Optionally, display messages if available */}
            {selectedLog.messages && selectedLog.messages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-2xl font-semibold mb-4 text-gray-200">Messages</h3>
                {Object.entries(currentMessage || {}).map(([date, messages]) => (
                  <div key={date} className="mb-4">
                    <h4 className="text-xl font-semibold mb-2 text-gray-200">{date}</h4>
                    {messages.map((msg) => (
                      <div key={msg.id} className="mb-2">
                        <p className="text-gray-200">
                          <strong>{msg.name}:</strong> {msg.message}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {moment(msg.dateSent).format('hh:mm A')}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
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
