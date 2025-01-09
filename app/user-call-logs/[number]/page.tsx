'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; // Added import
import { Button, Input, Label } from 'shadcn-react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { PencilIcon, XIcon } from '@heroicons/react/outline'; // Import the X icon for modal close

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
  first_name?: string;
  createdAt: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name?: string;
  company_website?: string;
  email_address?: string;
}

const UserCallLogs: React.FC = () => {
  const { number: encodedNumber } = useParams() as { number: string };
  const searchParams = useSearchParams();
  const userId = searchParams?.get('user') || '';
  const number = decodeURIComponent(encodedNumber);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callerName, setCallerName] = useState<string>('Unknown Caller');
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // For Contact Info modal

  useEffect(() => {
    if (!number) {
      setError('No phone number provided');
      setLoading(false);
      return;
    }

    const fetchCallLogs = async () => {
      try {
        setLoading(true);

        const callLogsResponse = await axios.get('/api/get-call-logs-by-number', {
          params: { number, page },
          headers: { 'Authorization': `Bearer ${userId}` }
        });

        const contactsResponse = await axios.get('/api/contacts', {
          params: { userId }
        });
        const contacts = contactsResponse.data;
        const contact = contacts.find(
          (contact: any) =>
            contact.phone &&
            contact.phone.replace(/\D/g, '') === number.replace(/\D/g, '')
        );

        setCallerName(
          contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Caller'
        );
        setContact(contact || { id: '', first_name: '', last_name: '', phone: number });

        const { logs, hasMore: moreLogs } = callLogsResponse.data;
        setCallLogs(logs);
        setHasMore(moreLogs);
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data || error.message);
          setError(
            `Failed to fetch call logs: ${error.response?.statusText || error.message}`
          );
        } else {
          console.error('Unexpected Error:', error);
          setError('An unexpected error occurred while fetching call logs.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, [number, page, userId]);

  const openCallLogModal = (log: CallLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
    setIsContactModalOpen(false); // Ensure Contact modal is closed when Call Log modal is opened
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
    setIsModalOpen(false); // Ensure Call Log modal is closed when Contact Info modal is opened
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsContactModalOpen(false); // Close any open modal
  };

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (contact) {
      let value = e.target.value;

      if (e.target.name === 'phone') {
        value = value.replace(/\D/g, '');
      }

      setContact({
        ...contact,
        [e.target.name]: value,
      });
    }
  };

  const saveContactChanges = async () => {
    if (contact) {
      try {
        if (contact.id) {
          const response = await axios.put('/api/update-contact', contact, {
            headers: { 'Authorization': `Bearer ${userId}` }
          });
          alert('Contact updated successfully!');
        } else {
          const response = await axios.post('/api/add-contact', {
            firstName: contact.first_name,
            lastName: contact.last_name,
            phone: contact.phone,
            emailAddress: contact.email_address,
            userId: userId
          });
          alert('Contact added successfully!');
        }
        setIsEditing(false);
        setIsContactModalOpen(false); // Close modal after save
      } catch (error) {
        console.error('Error saving contact:', error);
        alert('Failed to save contact.');
      }
    }
  };

  return (
    <div className="p-4 mt-16 pb-20 max-w-full overflow-hidden flex gap-6">
      {/* Added pb-20 to provide space for sticky nav */}
      <div className="w-full lg:w-2/3 pr-4 lg:pl-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 text-center md:text-left">
          Call Logs for{' '}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={openContactModal} // Open Contact Modal when clicking on name
          >
            {callerName}
          </span>
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : callLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto dark:bg-black rounded-lg shadow-md">
              <table
                className="min-w-full border-separate"
                style={{ borderSpacing: '0 0.5em' }}
              >
                <thead className="dark:bg-black">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Caller</th>
                    <th className="py-2 px-4 border-b text-left">Type</th>
                    <th className="py-2 px-4 border-b text-left">Time</th>
                    <th className="py-2 px-4 border-b text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => openCallLogModal(log)}
                    >
                      <td className="py-2 px-4 border-b">
                        {log.fullName || log.customer?.number || 'Unknown'}
                      </td>
                      <td
                        className={`py-2 px-4 border-b ${
                          log.type === 'inboundPhoneCall'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        } dark:${
                          log.type === 'inboundPhoneCall'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}
                      >
                        {log.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {moment(log.createdAt).format('DD/MM/YY hh:mm A')}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {moment
                          .utc(moment(log.endedAt).diff(moment(log.startedAt)))
                          .format('HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={goToPreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                onClick={goToNextPage}
                disabled={!hasMore}
                className={`px-4 py-2 rounded ${
                  !hasMore
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No call logs found for this number.</p>
        )}
      </div>

      {/* Call Log Modal */}

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center dark:bg-black dark:bg-opacity-70 bg-white bg-opacity-70 z-50">
          <div className="dark:bg-gray-800 p-6 w-full max-w-3xl mx-auto relative shadow-lg bg-modal rounded-2xl">
            <h2 className="text-3xl font-semibold mb-6 text-black dark:text-white">
              Call Details
            </h2>

            {selectedLog.fullName && (
              <p className="text-lg mb-4 text-gray-200">
                <strong className="taxt-gray-700 dark:text-gray-400">
                  Full Name:
                </strong>
                <Link
                  href={`/user-call-logs/${selectedLog.customer?.number || ''}?user=${userId}`}
                  legacyBehavior
                >
                  <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                    {selectedLog.fullName}
                  </a>
                </Link>
              </p>
            )}

            <p className="text-lg mb-4 text-gray-200">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Caller:
              </strong>
              <Link
                href={`/user-call-logs/${selectedLog.customer?.number || ''}?user=${userId}`}
                legacyBehavior
              >
                <a className="text-blue-400 hover:text-blue-500 underline ml-2 cursor-pointer">
                  {selectedLog.customer?.number || 'Unknown'}
                </a>
              </Link>
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Type:
              </strong>{' '}
              {selectedLog.type === 'inboundPhoneCall' ? 'Inbound' : 'Outbound'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Started At:
              </strong>{' '}
              {selectedLog.startedAt
                ? moment(selectedLog.startedAt).format('MM/DD/YY hh:mm A')
                : 'Not connected'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Ended At:
              </strong>{' '}
              {selectedLog.endedAt
                ? moment(selectedLog.endedAt).format('MM/DD/YY hh:mm A')
                : 'Not connected'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Duration:
              </strong>{' '}
              {selectedLog.startedAt && selectedLog.endedAt
                ? moment
                    .utc(
                      moment(selectedLog.endedAt).diff(
                        moment(selectedLog.startedAt)
                      )
                    )
                    .format('HH:mm:ss')
                : 'N/A'}
            </p>

            <p className="text-lg mb-4 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Assistant:
              </strong>{' '}
              {selectedLog.assistant?.name || 'Unknown'}
            </p>

            <p className="text-lg mb-6 text-gray-800 dark:text-white">
              <strong className="taxt-gray-700 dark:text-gray-400">
                Summary:
              </strong>{' '}
              {selectedLog.summary || 'N/A'}
            </p>

            {selectedLog.recordingUrl && (
              <div className="mb-6">
                <strong className="taxt-gray-700 dark:text-gray-400">
                  Recording:
                </strong>
                <audio controls className="mt-2 w-full">
                  <source src={selectedLog.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <button
              onClick={closeModal}
              className="mt-4 px-6 py-2 bg-red-600 dark:text-white text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 dark:bg-black bg-opacity-50 flex justify-center items-center">
          <div className="dark:bg-black bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-800"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold mb-6">Contact Info</h2>
            <div className="space-y-4">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                type="text"
                id="first_name"
                name="first_name"
                value={contact?.first_name || ''}
                onChange={handleContactChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                type="text"
                id="last_name"
                name="last_name"
                value={contact?.last_name || ''}
                onChange={handleContactChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={contact?.phone || ''}
                onChange={handleContactChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {/* Advanced section goes here */}
              <Button
                onClick={saveContactChanges}
                className="w-full py-2 bg-blue-600 dark:text-white rounded-md mt-6"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCallLogs;
