'use client';

import React, { useState, useEffect } from 'react';
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

const CallLogsClient: React.FC<{ userId: string }> = ({ userId }) => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setLoading(true);

        const response = await axios.get('/api/get-call-logs', {
          params: { userId },
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
    };

    fetchCallLogs();
  }, [userId]);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
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

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-black p-6 rounded-lg w-full max-w-2xl mx-auto relative">
            <h2 className="text-2xl font-bold mb-4">Call Details</h2>
            {selectedLog.fullName && (
              <p>
                <strong>Full Name:</strong>
                <Link
                  href={`/user-call-logs/${selectedLog.customer?.number || ''}`}
                  legacyBehavior
                >
                  <a className="text-blue-500 underline ml-2 cursor-pointer">
                    {selectedLog.fullName}
                  </a>
                </Link>
              </p>
            )}
            <p>
              <strong>Caller:</strong>
              <Link
                href={`/user-call-logs/${selectedLog.customer?.number || ''}`}
                legacyBehavior
              >
                <a className="text-blue-500 underline ml-2 cursor-pointer">
                  {selectedLog.customer?.number || 'Unknown'}
                </a>
              </Link>
            </p>
            <p>
              <strong>Type:</strong>{' '}
              {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
            </p>
            <p>
              <strong>Started At:</strong>{' '}
              {moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')}
            </p>
            <p>
              <strong>Ended At:</strong>{' '}
              {moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')}
            </p>
            <p>
              <strong>Duration:</strong>{' '}
              {moment
                .utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt)))
                .format('HH:mm:ss')}
            </p>
            <p>
              <strong>Assistant:</strong> {selectedLog.assistant?.name || 'Unknown'}
            </p>
            <p>
              <strong>Summary:</strong> {selectedLog.summary || 'N/A'}
            </p>
            <audio controls className="mt-4 mx-auto block">
              <source src={selectedLog.recordingUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
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
