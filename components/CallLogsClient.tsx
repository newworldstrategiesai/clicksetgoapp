'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faClock,
  faUser,
  faTh,
  faVoicemail,
} from '@fortawesome/free-solid-svg-icons';
import CallLogsList from './CallLogsList'; // Adjust the path based on your project structure
import { CallLog } from '../types'; // Import the common CallLog type
import { supabase } from '@/utils/supabaseClient'; // Import the Supabase client

const CallLogsClient: React.FC<{ userId: string; vapiKey: string }> = ({ userId, vapiKey }) => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(10);

  const fetchCallLogs = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get('/api/get-call-logs', {
        params: { userId, limit},
        headers: {
          'Authorization': `Bearer ${vapiKey}`, // Send vapiKey as a bearer token
        },
      });

      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) {
        console.error('Error fetching contacts from Supabase:', contactsError);
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
    } catch (error) {
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
    setLimit((prevLimit) => prevLimit + 10); // Increase limit by 10
    fetchCallLogs();
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white pt-16 pb-16">
      <div className="flex justify-between px-4 items-center mb-4">
        <h1 className="text-3xl font-semibold">Voicemail</h1>
        <button className="text-blue-500">Greeting</button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}
      <ul className="space-y-4 px-4">
        {callLogs.map((log, index) => (
          <li
            key={index}
            onClick={() => openModal(log)}
            className="flex justify-between items-center p-3 border-b border-gray-700 cursor-pointer"
          >
            <div className="flex flex-col">
              <p className="text-lg">{log.fullName || log.customer?.number || 'Unknown'}</p>
              <p
                className={`text-sm ${
                  log.type === 'inboundPhoneCall' ? 'text-yellow-500' : 'text-green-500'
                }`}
              >
                {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {moment(log.startedAt).format('MMM D, h:mm A')}
              </p>
              <p className="text-sm text-gray-400">
                {moment
                  .utc(moment(log.endedAt).diff(moment(log.startedAt)))
                  .format('mm:ss')}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={loadMoreLogs}
        className={`mt-4 mx-auto px-4 py-2 text-white rounded-lg ${loading ? 'bg-blue-100': 'bg-blue-500'}`}
        disabled={loading}
      >
        Load More
      </button>

      {isModalOpen && selectedLog && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl mx-auto relative shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-white">Call Details</h2>

      {selectedLog.fullName && (
        <p className="text-lg mb-4 text-gray-200">
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

      <p className="text-lg mb-4 text-gray-200">
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

      <p className="text-lg mb-4 text-gray-200">
        <strong className="text-gray-400">Type:</strong>{' '}
        {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
      </p>

      <p className="text-lg mb-4 text-gray-200">
        <strong className="text-gray-400">Started At:</strong>{' '}
        {moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')}
      </p>

      <p className="text-lg mb-4 text-gray-200">
        <strong className="text-gray-400">Ended At:</strong>{' '}
        {moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')}
      </p>

      <p className="text-lg mb-4 text-gray-200">
        <strong className="text-gray-400">Duration:</strong>{' '}
        {moment
          .utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt)))
          .format('HH:mm:ss')}
      </p>

      <p className="text-lg mb-4 text-gray-200">
        <strong className="text-gray-400">Assistant:</strong> {selectedLog.assistant?.name || 'Unknown'}
      </p>

      <p className="text-lg mb-6 text-gray-200">
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
        className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-black border-t border-gray-700 flex justify-around py-4 text-white">
        <Link href="/favorites">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faStar} size="lg" />
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>
        <Link href="/campaigns">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faClock} size="lg" />
            <span className="text-xs mt-1">Scheduled</span>
          </div>
        </Link>
        <Link href="/contacts">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faUser} size="lg" />
            <span className="text-xs mt-1">Contacts</span>
          </div>
        </Link>
        <Link href="/dialer">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faTh} size="lg" />
            <span className="text-xs mt-1">Keypad</span>
          </div>
        </Link>
        <Link href="/call-logs">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faVoicemail} size="lg" />
            <span className="text-xs mt-1">Calls</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CallLogsClient;
