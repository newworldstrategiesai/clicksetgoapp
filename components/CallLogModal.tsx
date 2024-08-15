import React from 'react';
import moment from 'moment';
import Link from 'next/link';

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

interface CallLogModalProps {
  log: CallLog;
  onClose: () => void;
}

const CallLogModal: React.FC<CallLogModalProps> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-black p-6 rounded-lg w-full max-w-2xl mx-auto relative">
        <h2 className="text-2xl font-bold mb-4">Call Details</h2>
        {log.fullName && (
          <p>
            <strong>Full Name:</strong>
            <Link href={`/user-call-logs/${log.customer?.number || ''}`} legacyBehavior>
              <a className="text-blue-500 underline ml-2 cursor-pointer">
                {log.fullName}
              </a>
            </Link>
          </p>
        )}
        <p>
          <strong>Caller:</strong>
          <Link href={`/user-call-logs/${log.customer?.number || ''}`} legacyBehavior>
            <a className="text-blue-500 underline ml-2 cursor-pointer">
              {log.customer?.number || 'Unknown'}
            </a>
          </Link>
        </p>
        <p><strong>Type:</strong> {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}</p>
        <p><strong>Started At:</strong> {moment(log.startedAt).format('MM/DD/YY hh:mm A')}</p>
        <p><strong>Ended At:</strong> {moment(log.endedAt).format('MM/DD/YY hh:mm A')}</p>
        <p><strong>Duration:</strong> {moment.utc(moment(log.endedAt).diff(moment(log.startedAt))).format('HH:mm:ss')}</p>
        <p><strong>Assistant:</strong> {log.assistant?.name || 'Unknown'}</p>
        <p><strong>Summary:</strong> {log.summary || 'N/A'}</p>
        <audio controls className="mt-4 mx-auto block">
          <source src={log.recordingUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
};

export default CallLogModal;
