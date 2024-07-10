import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';

interface SMSLog {
  sid: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
}

const SMSLogs = () => {
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSMSLogs = async () => {
      try {
        const response = await axios.get('/api/get-sms-logs');
        setSmsLogs(response.data);
      } catch (error) {
        setError('Failed to fetch SMS logs');
      } finally {
        setLoading(false);
      }
    };

    fetchSMSLogs();
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">SMS Logs</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b">From</th>
                  <th className="py-2 px-4 border-b">To</th>
                  <th className="py-2 px-4 border-b">Message</th>
                  <th className="py-2 px-4 border-b">Date Sent</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.map((log) => (
                  <tr key={log.sid} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{log.from}</td>
                    <td className="py-2 px-4 border-b">{log.to}</td>
                    <td className="py-2 px-4 border-b">{log.body}</td>
                    <td className="py-2 px-4 border-b">{log.dateSent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SMSLogs;
