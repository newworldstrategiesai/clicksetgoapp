import React from 'react';
import moment from 'moment';

interface SMSLog {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

interface SMSLogModalProps {
  log: SMSLog;
  onClose: () => void;
}

const SMSLogModal: React.FC<SMSLogModalProps> = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-black p-6 rounded-lg w-full max-w-lg mx-auto relative text-white">
        <h2 className="text-2xl font-bold mb-4">SMS Details</h2>
        <p><strong>From:</strong> {log.from}</p>
        <p><strong>To:</strong> {log.to}</p>
        <p><strong>Message:</strong> {log.body}</p>
        <p><strong>Date Sent:</strong> {moment(log.dateSent).format('MM/DD/YY hh:mm A')}</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
};

export default SMSLogModal;
