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
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-modal text-gray-600 dark:bg-black p-6 rounded-2xl w-full max-w-lg mx-auto relative dark:text-white border-2 border-solid border-gray-500 ">
        <h2 className="text-2xl font-bold mb-4">SMS Details</h2>
        <p><strong>From:</strong> {log.from}</p>
        <p><strong>To:</strong> {log.to}</p>
        <p><strong>Message:</strong> {log.body}</p>
        <p><strong>Date Sent:</strong> {moment(log.dateSent).format('MM/DD/YY hh:mm A')}</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 dark:text-white rounded-lg text-gray-200">Close</button>
      </div>
    </div>
  );
};

export default SMSLogModal;
