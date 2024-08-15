'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

const OutboundCall = () => {
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>('');
  const [clientNumber, setClientNumber] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [callReason, setCallReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        setTwilioNumbers(response.data);
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
      }
    };

    fetchTwilioNumbers();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/make-outbound-call', {
        contact: {
          phone: clientNumber,
          first_name: clientName,
        },
        reason: callReason,
        twilioNumber: selectedTwilioNumber,
      });

      setMessage('Call initiated successfully!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle AxiosError
        setMessage('Failed to initiate call.');
        console.error('Error initiating call:', error.response?.data || error.message);
      } else {
        // Handle other types of errors
        setMessage('An unexpected error occurred.');
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Make an Outbound Call</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-4 rounded-lg">
        <div className="mb-4">
          <label htmlFor="twilioNumber" className="block mb-2">Twilio Number</label>
          <select
            id="twilioNumber"
            value={selectedTwilioNumber}
            onChange={(e) => setSelectedTwilioNumber(e.target.value)}
            className="w-full p-2 border rounded-lg bg-black text-white"
          >
            <option value="" disabled>Select a Twilio number</option>
            {twilioNumbers.map((number) => (
              <option key={number.sid} value={number.phoneNumber}>
                {number.phoneNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="clientNumber" className="block mb-2">Client Phone Number</label>
          <input
            type="text"
            id="clientNumber"
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
            className="w-full p-2 border rounded-lg bg-black text-white"
            placeholder="+1234567890"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="clientName" className="block mb-2">Client Name</label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-2 border rounded-lg bg-black text-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="callReason" className="block mb-2">Reason for Calling</label>
          <textarea
            id="callReason"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="w-full p-2 border rounded-lg bg-black text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? 'Calling...' : 'Call Now'}
        </button>
        {message && <p className="mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default OutboundCall;
