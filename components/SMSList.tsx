import React from 'react';
import moment from 'moment';

interface SMSLog {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

interface SMSListProps {
  logs: SMSLog[];
  onRowClick: (log: SMSLog) => void;
  currentPage: number;
  logsPerPage: number;
  totalLogs: number;
  paginate: (pageNumber: number) => void;
}

const SMSList: React.FC<SMSListProps> = ({
  logs,
  onRowClick,
  currentPage,
  logsPerPage,
  totalLogs,
  paginate
}) => {
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-grow">
        <table
          className="min-w-full border-separate"
          style={{ borderSpacing: '0 1em' }}
        >
          <thead className="bg-transparent">
            <tr>
              <th className="py-2 px-4 border-b text-left">From</th>
              <th className="py-2 px-4 border-b text-left">To</th>
              <th className="py-2 px-4 border-b text-left">Date Sent</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(logs) && logs.length > 0 ? (
              logs.map((log, index) => (
                <tr
                  key={`${log.id}-${index}`}
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={() => onRowClick(log)}
                >
                  <td className="py-2 px-4 border-b truncate max-w-xs">
                    {log.from}
                  </td>
                  <td className="py-2 px-4 border-b truncate max-w-xs">
                    {log.to}
                  </td>
                  <td className="py-2 px-4 border-b truncate max-w-xs">
                    {moment(log.dateSent).format('MM/DD/YY hh:mm A')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-2">
                  No SMS logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="flex justify-center mt-4">
        <ul className="pagination flex space-x-2">
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`py-2 px-4 ${currentPage === number ? 'bg-blue-500 text-white' : ''} border rounded`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SMSList;
