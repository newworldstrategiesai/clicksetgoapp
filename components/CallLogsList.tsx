'use client';

import React from 'react';
import moment from 'moment'; // Import moment for date formatting

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
  fullName: string;
}

interface CallLogsListProps {
  logs: CallLog[];
  openModal: (log: CallLog) => void;
  handleSort: (column: string) => void;
}

const CallLogsList: React.FC<CallLogsListProps> = ({ logs, openModal, handleSort }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-grow px-2">
        <table className="min-w-full md:max-w-800px mx-auto border-separate" style={{ borderSpacing: "0 0.5em", maxWidth: '100%' }}>
          <thead className="bg-transparent">
            <tr>
              <th onClick={() => handleSort('fullName')} className="py-1 px-2 border-b border-white text-white cursor-pointer">Caller</th>
              <th onClick={() => handleSort('type')} className="py-1 px-2 border-b border-white text-white cursor-pointer">Type</th>
              <th onClick={() => handleSort('startedAt')} className="py-1 px-2 border-b border-white text-white cursor-pointer">Time</th>
              <th onClick={() => handleSort('duration')} className="py-1 px-2 border-b border-white text-white cursor-pointer">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => openModal(log)}>
                <td className="py-1 px-2 border-b border-white text-white">{log.fullName || log.customer?.number || 'Unknown'}</td>
                <td className="py-1 px-2 border-b border-white text-white">{log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}</td>
                <td className="py-1 px-2 border-b border-white text-white">{moment(log.startedAt).format('MM/DD/YY hh:mm A')}</td>
                <td className="py-1 px-2 border-b border-white text-white">{moment.utc(moment(log.endedAt).diff(moment(log.startedAt))).format('HH:mm:ss')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallLogsList;
