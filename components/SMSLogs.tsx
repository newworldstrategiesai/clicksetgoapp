import React, { useState, useEffect } from 'react';
import SMSList from './SMSList'; // Adjust the import path as needed

interface SMSLog {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

const SMSLogs = () => {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [logsPerPage] = useState<number>(10); // Adjust if needed
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch logs and other data
    // For example:
    // fetchLogs().then(data => {
    //   setLogs(data.logs);
    //   setTotalLogs(data.totalLogs);
    // }).catch(err => setError(err.message));
  }, [currentPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRowClick = (log: SMSLog) => {
    // Handle row click, e.g., show details
    console.log('Row clicked:', log);
  };

  const currentLogs = logs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  return (
    <div>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <SMSList
          logs={currentLogs}
          onRowClick={handleRowClick}
          currentPage={currentPage}
          logsPerPage={logsPerPage}
          totalLogs={totalLogs}
          paginate={paginate}
        />
      )}
    </div>
  );
};

export default SMSLogs;
