'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams } from 'next/navigation';
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
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callerName, setCallerName] = useState<string>('');

  useEffect(() => {
    if (!number) {
      setError('No phone number provided');
      setLoading(false);
      return;
    }

    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/get-call-logs-by-number`, {
          params: { number },
        });

        const contactsResponse = await axios.get('/api/contacts');
        const contacts = contactsResponse.data;
        const contact = contacts.find((contact: any) => contact.phone.replace(/\D/g, '') === number.replace(/\D/g, ''));
        if (contact) {
          setCallerName(`${contact.first_name} ${contact.last_name}`);
        } else {
          setCallerName('Unknown Caller');
        }

        // Ensure no duplicates by using a Set
        const uniqueLogs = Array.from(new Set(response.data.map((log: CallLog) => log.id)))
          .map(id => {
            return response.data.find((log: CallLog) => log.id === id);
          });
        setCallLogs(uniqueLogs);
      } catch (error: any) {
        setError(`Failed to fetch call logs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, [number]);

  const openModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 mt-16 max-w-full overflow-hidden">
      <h1 className="text-xl iphone-se:text-2xl iphone-12-pro:text-3xl iphone-14-pro-max:text-4xl ipad-air:text-5xl mb-4 text-center md:text-left">Call Logs for {callerName}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate" style={{ borderSpacing: '0 0.5em' }}>
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
                <tr key={log.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => openModal(log)}>
                  <td className="py-2 px-4 border-b">{log.fullName || log.customer?.number || 'Unknown'}</td>
                  <td className="py-2 px-4 border-b">{log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}</td>
                  <td className="py-2 px-4 border-b">{moment(log.startedAt).format('MM/DD/YY hh:mm A')}</td>
                  <td className="py-2 px-4 border-b">{moment.utc(moment(log.endedAt).diff(moment(log.startedAt))).format('HH:mm:ss')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && selectedLog && (
        <CallLogModal log={selectedLog} onClose={closeModal} />
      )}
    </div>
  );
};

export default UserCallLogs;
