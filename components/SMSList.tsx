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

const SMSList: React.FC<SMSListProps> = ({ logs, onRowClick, currentPage, logsPerPage, totalLogs, paginate }) => {
  const pageNumbers = [];
  const maxPageButtons = 4;

  for (let i = 1; i <= Math.ceil(totalLogs / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(startPage + maxPageButtons - 1, pageNumbers.length);

  const visiblePageNumbers = pageNumbers.slice(startPage - 1, endPage);

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-grow">
        <table className="min-w-full border-separate" style={{ borderSpacing: "0 1em" }}>
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
                // Combine `log.id` with `index` to ensure uniqueness
                <tr key={`${log.id}-${index}`} className="hover:bg-gray-700 cursor-pointer" onClick={() => onRowClick(log)}>
                  <td className="py-2 px-4 border-b truncate max-w-xs">{log.from}</td>
                  <td className="py-2 px-4 border-b truncate max-w-xs">{log.to}</td>
                  <td className="py-2 px-4 border-b truncate max-w-xs">{moment(log.dateSent).format('MM/DD/YY hh:mm A')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-2">No SMS logs available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="flex justify-center mt-4">
        <ul className="pagination flex space-x-2">
          {startPage > 1 && (
            <li className="page-item">
              <button onClick={() => paginate(1)} className="page-link py-2 px-4 bg-transparent text-white border border-white hover:bg-gray-300">
                1
              </button>
            </li>
          )}
          {visiblePageNumbers.map(number => (
            <li key={number} className="page-item">
              <button onClick={() => paginate(number)} className={`page-link py-2 px-4 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-transparent text-white'} border border-white hover:bg-gray-300`}>
                {number}
              </button>
            </li>
          ))}
          {endPage < pageNumbers.length && (
            <li className="page-item">
              <button onClick={() => paginate(pageNumbers.length)} className="page-link py-2 px-4 bg-transparent text-white border border-white hover:bg-gray-300">
                Last Page
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default SMSList;
