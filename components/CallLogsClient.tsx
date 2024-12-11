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

  // Pagination states
  const [limit] = useState(10); // Fixed limit per page
  const [firstTimestamp, setFirstTimestamp] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [currPage, setCurrPage] = useState(1);
  const fetchCallLogs = useCallback(
    async (direction?: 'next' | 'previous') => {
      try {
        setLoading(true);
        setError('');
  
        const params: any = { userId, limit };
       
        // Handle navigation direction
        if (direction === 'previous' && lastTimestamp) {
          params.createdAtGe = lastTimestamp; // Fetch logs starting from the last dataset
          params.createdAtLe = null; // Clear the previous filter
          setCurrPage(curr => curr - 1)
        } else if (direction === 'next' && firstTimestamp) {
          params.createdAtLe = firstTimestamp; // Fetch logs ending at the first dataset
          params.createdAtGe = null; // Clear the next filter
          setCurrPage(curr => curr + 1)
        }
  
        const response = await axios.get('/api/get-call-logs', {
          params,
          headers: {
            Authorization: `Bearer ${vapiKey}`,
          },
        });
  
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', userId);
  
        if (contactsError) {
          console.error('Error fetching contacts from Supabase:', contactsError);
          return;
        }
  
        const callLogsData = response.data.map((log: CallLog) => {
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
  
        // Sort the data in Descending order by startedAt or createdAt
        callLogsData.sort((a: CallLog, b: CallLog) => {
          const dateA = a.startedAt || a.createdAt;
          const dateB = b.startedAt || b.createdAt;
          return moment(dateA).isBefore(moment(dateB)) ? 1 : -1; // Descending order
        });
  
        // Update state
        setCallLogs(callLogsData);
  
        if (callLogsData.length > 0) {
          setLastTimestamp(callLogsData[0].startedAt || callLogsData[0].createdAt);
          setFirstTimestamp(
            callLogsData[callLogsData.length - 1].startedAt ||
              callLogsData[callLogsData.length - 1].createdAt
          );
        } 
    }catch (error) {
      console.error('Error fetching call logs:', error);
      setError('Failed to fetch call logs');
    } finally {
      setLoading(false);
    }
    },
    [userId, vapiKey, limit, firstTimestamp, lastTimestamp]
  );

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-black dark:text-white pb-24">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {moment(log.startedAt || log.createdAt).format('MMM D, h:mm A')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {log.startedAt && log.endedAt ? (
                  moment
                    .utc(moment(log.endedAt).diff(moment(log.startedAt))).format('mm:ss')) : ("N/A")
                }
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-between px-4 mt-4">
      <button
          onClick={() => fetchCallLogs('previous')}
          className={`px-4 py-2 text-white rounded-lg ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'} ${currPage === 1 ? 'invisible' : ''}`}
          disabled={loading}
        >
        Previous
        </button>
        <p>Page: {currPage}</p>
      <button
          onClick={() => fetchCallLogs('next')}
          className={`px-4 py-2 text-white rounded-lg ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'}`}
      >          
      Next
      </button>
      </div>
      {isModalOpen && selectedLog && (
  <div className="fixed inset-0 flex items-center justify-center dark:bg-black dark:bg-opacity-70 bg-white bg-opacity-70 z-50">
    <div className="dark:bg-gray-800 p-6 w-full max-w-3xl mx-auto relative shadow-lg bg-modal rounded-2xl">
      <h2 className="text-3xl font-semibold mb-6 text-black dark:text-white">Call Details</h2>

      {selectedLog.fullName && (
        <p className="text-lg mb-4 text-gray-200">
          <strong className="taxt-gray-700 dark:text-gray-400">Full Name:</strong>
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
        <strong className="text-gray-700 dark:text-gray-400">Caller:</strong>
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
        <strong className="taxt-gray-700 dark:text-gray-400">Type:</strong>{' '}
        {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
      </p>

      <p className="text-lg mb-4 text-gray-800 dark:text-white">
        <strong className="taxt-gray-700 dark:text-gray-400">Started At:</strong>{' '}
        {selectedLog.startedAt ? moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A') : 'Not connected'}
      </p>

      <p className="text-lg mb-4 text-gray-800 dark:text-white">
        <strong className="taxt-gray-700 dark:text-gray-400">Ended At:</strong>{' '}
        {selectedLog.endedAt ? moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A') : 'Not connected'}
      </p>

      <p className="text-lg mb-4 text-gray-800 dark:text-white">
        <strong className="taxt-gray-700 dark:text-gray-400">Duration:</strong>{' '}
        {selectedLog.startedAt && selectedLog.endedAt ? (
          moment
            .utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt)))
            .format('HH:mm:ss')
        ) : ("N/A")}
      </p>

      <p className="text-lg mb-4 text-gray-800 dark:text-white">
        <strong className="taxt-gray-700 dark:text-gray-400">Assistant:</strong> {selectedLog.assistant?.name || 'Unknown'}
      </p>

      <p className="text-lg mb-6 text-gray-800 dark:text-white">
        <strong className="taxt-gray-700 dark:text-gray-400">Summary:</strong> {selectedLog.summary || 'N/A'}
      </p>

      {selectedLog.recordingUrl && (
        <div className="mb-6">
          <strong className="taxt-gray-700 dark:text-gray-400">Recording:</strong>
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-5/6 backdrop-opacity-50 backdrop-invert bg-white dark:bg-black border-t border-gray-700 flex justify-around py-4 dark:text-white m-auto">
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
