'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import CallLogsList from './CallLogsList'; // Adjust the path based on your project structure
import { CallLog } from '../types'; // Import the common CallLog type

const CallLogsClient: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const lastCreatedAt = callLogs.length ? callLogs[callLogs.length - 1].createdAt : undefined;
        const response = await axios.get('/api/get-call-logs', {
          params: {
            pageSize: 30,
            lastCreatedAt
          }
        });

        const contactsResponse = await axios.get('/api/contacts');
        const contacts = contactsResponse.data;

        const callLogsData = response.data.map((log: CallLog) => {
          const contact = contacts.find((contact: any) => contact.phone.replace(/\D/g, '') === log.customer?.number.replace(/\D/g, ''));
          if (contact) {
            log.fullName = `${contact.first_name} ${contact.last_name}`;
          }
          return log;
        });

        setCallLogs((prevLogs) => {
          const newLogs = [...prevLogs, ...callLogsData];
          const uniqueLogs = Array.from(new Set(newLogs.map((log) => log.id))).map(id => {
            return newLogs.find((log) => log.id === id);
          });
          return uniqueLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        setHasMore(callLogsData.length === 30);
      } catch (error) {
        setError('Failed to fetch call logs');
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, [callLogs.length]);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const lastLogElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setLoading(true);
        const fetchMoreLogs = async () => {
          const lastCreatedAt = callLogs.length ? callLogs[callLogs.length - 1].createdAt : undefined;
          try {
            const response = await axios.get('/api/get-call-logs', {
              params: {
                pageSize: 30,
                lastCreatedAt
              }
            });

            const contactsResponse = await axios.get('/api/contacts');
            const contacts = contactsResponse.data;

            const callLogsData = response.data.map((log: CallLog) => {
              const contact = contacts.find((contact: any) => contact.phone.replace(/\D/g, '') === log.customer?.number.replace(/\D/g, ''));
              if (contact) {
                log.fullName = `${contact.first_name} ${contact.last_name}`;
              }
              return log;
            });

            setCallLogs((prevLogs) => {
              const newLogs = [...prevLogs, ...callLogsData];
              const uniqueLogs = Array.from(new Set(newLogs.map((log) => log.id))).map(id => {
                return newLogs.find((log) => log.id === id);
              });
              return uniqueLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });

            setHasMore(callLogsData.length === 30);
          } catch (error) {
            setError('Failed to fetch call logs');
          } finally {
            setLoading(false);
          }
        };

        fetchMoreLogs();
      }
    });

    if (lastLogElementRef.current) {
      observer.current.observe(lastLogElementRef.current);
    }
  }, [loading, hasMore]);

  return (
    <div className="p-4 h-screen">
      <h1 className="text-2xl font-semibold mb-4">Call Logs</h1>
      {error && <p className="text-red-500">{error}</p>}
      <>
        <CallLogsList
          logs={callLogs}
          openModal={openModal}
        />
        {loading && <p>Loading...</p>}
        <div ref={lastLogElementRef} />
        {isModalOpen && selectedLog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-black p-6 rounded-lg w-full max-w-2xl mx-auto relative">
              <h2 className="text-2xl font-bold mb-4">Call Details</h2>
              {selectedLog.fullName && (
                <p>
                  <strong>Full Name:</strong>
                  <Link href={`/user-call-logs/${selectedLog.customer?.number || ''}`} legacyBehavior>
                    <a className="text-blue-500 underline ml-2 cursor-pointer">
                      {selectedLog.fullName}
                    </a>
                  </Link>
                </p>
              )}
              <p>
                <strong>Caller:</strong>
                <Link href={`/user-call-logs/${selectedLog.customer?.number || ''}`} legacyBehavior>
                  <a className="text-blue-500 underline ml-2 cursor-pointer">
                    {selectedLog.customer?.number || 'Unknown'}
                  </a>
                </Link>
              </p>
              <p><strong>Type:</strong> {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}</p>
              <p><strong>Started At:</strong> {moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')}</p>
              <p><strong>Ended At:</strong> {moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')}</p>
              <p><strong>Duration:</strong> {moment.utc(moment(selectedLog.endedAt).diff(moment(selectedLog.startedAt))).format('HH:mm:ss')}</p>
              <p><strong>Assistant:</strong> {selectedLog.assistant?.name || 'Unknown'}</p>
              <p><strong>Summary:</strong> {selectedLog.summary || 'N/A'}</p>
              <audio controls className="mt-4 mx-auto block">
                <source src={selectedLog.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button onClick={closeModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Close</button>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default CallLogsClient;
