'use client';

import React from 'react';
import moment from 'moment';
import { CallLog } from '../types'; // Import the common CallLog type

interface CallLogsListProps {
  logs: CallLog[];
  openModal: (log: CallLog) => void;
}

const CallLogsList: React.FC<CallLogsListProps> = ({ logs, openModal }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-grow px-2">
        <table className="min-w-full md:max-w-800px mx-auto border-separate" style={{ borderSpacing: "0 0.5em", maxWidth: '100%' }}>
          <thead className="bg-transparent">
            <tr>
              <th className="py-2 px-4 border-b text-left">Full Name</th>
              <th className="py-2 px-4 border-b text-left">Caller</th>
              <th className="py-2 px-4 border-b text-left">Type</th>
              <th className="py-2 px-4 border-b text-left">Started At</th>
              <th className="py-2 px-4 border-b text-left">Ended At</th>
              <th className="py-2 px-4 border-b text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => openModal(log)}>
                <td className="py-2 px-4 border-b truncate max-w-xs">{log.fullName}</td>
                <td className="py-2 px-4 border-b truncate max-w-xs">{log.customer?.number}</td>
                <td className="py-2 px-4 border-b truncate max-w-xs">{log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}</td>
                <td className="py-2 px-4 border-b truncate max-w-xs">{moment(log.startedAt).format('MM/DD/YY hh:mm A')}</td>
                <td className="py-2 px-4 border-b truncate max-w-xs">{moment(log.endedAt).format('MM/DD/YY hh:mm A')}</td>
                <td className="py-2 px-4 border-b truncate max-w-xs">{moment.utc(moment(log.endedAt).diff(moment(log.startedAt))).format('HH:mm:ss')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallLogsList;
