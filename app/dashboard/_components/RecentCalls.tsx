// app/dashboard/_components/RecentCalls.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import { CallLog } from '@/types'; // Ensure this path is correct
import { supabase } from '@/utils/supabaseClient'; // Ensure this path is correct

interface RecentCallsProps {
  userId: string;
  vapiKey: string;
}

const RecentCalls: React.FC<RecentCallsProps> = ({ userId, vapiKey }) => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(5);

  const fetchCallLogs = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get('/api/get-call-logs', {
        params: { userId, limit },
        headers: {
          'Authorization': `Bearer ${vapiKey}`, // Send vapiKey as a bearer token
        },
      });

      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) {
        console.error('Error fetching contacts from Supabase:', contactsError);
        setError('Failed to fetch contacts');
        return;
      }

      const callLogsData = response.data.map((log: CallLog) => {
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
    } catch (error: any) {
      console.error('Error fetching call logs:', error);
      setError('Failed to fetch call logs');
    } finally {
      setLoading(false);
    }
  }, [userId, limit, vapiKey]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };
  
  const loadMoreLogs = () => {
    setLimit((prevLimit) => prevLimit + 5); // Increase limit by 5
    fetchCallLogs();
  };

  return (
    <div className="p-4 rounded-lg shadow-lg">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-400 mb-4">Loading recent calls...</p>}
      <ul className="space-y-2">
        {callLogs.map((log, index) => (
          <li
            key={index}
            onClick={() => openModal(log)}
            className="flex justify-between items-center p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          >
            <div>
              <p className="text-lg text-white">{log.fullName || log.customer?.number || 'Unknown'}</p>
              <p className={`text-sm ${log.type === 'inboundPhoneCall' ? 'text-yellow-500' : 'text-green-500'}`}>
                {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">{moment(log.startedAt).format('MMM D, h:mm A')}</p>
              <p className="text-sm text-gray-400">
                {moment.utc(moment(log.endedAt).diff(moment(log.startedAt))).format('mm:ss')}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {callLogs.length >= limit && (
        <button
          onClick={loadMoreLogs}
          className={`mt-4 w-full flex items-center justify-center p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors duration-200`}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center dark:bg-black bg-opacity-80 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl mx-auto relative shadow-lg">
            <h2 className="text-3xl font-semibold mb-6 text-white">Call Details</h2>

            {selectedLog.fullName && (
              <p className="text-lg mb-4 text-gray-300">
                <strong className="text-gray-400">Full Name:</strong>
                <Link
                  href={`/user-call-logs/${selectedLog.customer?.number || ''}`}
                  legacyBehavior
                >
                  <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                    {selectedLog.fullName}
                  </a>
                </Link>
              </p>
            )}

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Caller:</strong>
              <Link
                href={`/user-call-logs/${selectedLog.customer?.number || ''}?user=${userId}`}
                legacyBehavior
              >
                <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                  {selectedLog.customer?.number || 'Unknown'}
                </a>
              </Link>
            </p>

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Type:</strong>{' '}
              {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
            </p>

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Started At:</strong>{' '}
              {moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')}
            </p>

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Ended At:</strong>{' '}
              {moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')}
            </p>

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Duration:</strong>{' '}
              {moment.utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt))).format('HH:mm:ss')}
            </p>

            <p className="text-lg mb-4 text-gray-300">
              <strong className="text-gray-400">Assistant:</strong> {selectedLog.assistant?.name || 'Unknown'}
            </p>

            <p className="text-lg mb-6 text-gray-300">
              <strong className="text-gray-400">Summary:</strong> {selectedLog.summary || 'N/A'}
            </p>

            {selectedLog.recordingUrl && (
              <div className="mb-6">
                <strong className="text-gray-400">Recording:</strong>
                <audio controls className="mt-2 w-full">
                  <source src={selectedLog.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <button
              onClick={closeModal}
              className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentCalls;
