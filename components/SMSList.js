import React from 'react';

const SMSList = ({ logs, currentPage, logsPerPage, totalLogs, paginate }) => {
  const pageNumbers = [];
  const maxPageButtons = 5;

  for (let i = 1; i <= Math.ceil(totalLogs / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(startPage + maxPageButtons - 1, pageNumbers.length);

  const visiblePageNumbers = pageNumbers.slice(startPage - 1, endPage);

  return (
    <div>
      <div className="overflow-auto max-h-96">
        <table className="min-w-full border-separate" style={{ borderSpacing: "0 1em" }}>
          <thead className="bg-transparent">
            <tr>
              <th className="py-2 px-4 border-b border-white text-white">From</th>
              <th className="py-2 px-4 border-b border-white text-white">To</th>
              <th className="py-2 px-4 border-b border-white text-white">Message</th>
              <th className="py-2 px-4 border-b border-white text-white">Date Sent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.sid} className="hover:bg-gray-700">
                <td className="py-2 px-4 border-b border-white text-white">{log.from}</td>
                <td className="py-2 px-4 border-b border-white text-white">{log.to}</td>
                <td className="py-2 px-4 border-b border-white text-white">{log.body}</td>
                <td className="py-2 px-4 border-b border-white text-white">{log.dateSent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="flex justify-center mt-4">
        <ul className="pagination flex space-x-2">
          {startPage > 1 && (
            <li className="page-item">
              <button onClick={() => paginate(1)} className="page-link py-2 px-4 bg-gray-200 text-black border border-gray-300 hover:bg-gray-300">
                1
              </button>
            </li>
          )}
          {visiblePageNumbers.map(number => (
            <li key={number} className="page-item">
              <button onClick={() => paginate(number)} className="page-link py-2 px-4 bg-gray-200 text-black border border-gray-300 hover:bg-gray-300">
                {number}
              </button>
            </li>
          ))}
          {endPage < pageNumbers.length && (
            <li className="page-item">
              <button onClick={() => paginate(pageNumbers.length)} className="page-link py-2 px-4 bg-gray-200 text-black border border-gray-300 hover:bg-gray-300">
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
