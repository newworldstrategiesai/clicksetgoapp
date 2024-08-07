"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from 'utils/supabaseClient';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

const Dialer = () => {
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callReason, setCallReason] = useState(''); // New state for call reason

  useEffect(() => {
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        setTwilioNumbers(response.data);
        setSelectedTwilioNumber(response.data[0]?.phoneNumber || '');
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
      }
    };

    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase.from('contacts').select('*');
        if (error) throw error;
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchTwilioNumbers();
    fetchContacts();
  }, []);

  const handleButtonClick = (value: string) => {
    setInput(input + value);
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber.startsWith('+')) {
      return `+1${phoneNumber.replace(/[^0-9]/g, '')}`;
    }
    return phoneNumber;
  };

  const handleCall = async () => {
    if (!selectedTwilioNumber || !input || !callReason) {
      setError('Please enter a number, select a Twilio number, and provide a reason for the call.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input);
    const contact = contacts.find(contact => formatPhoneNumber(contact.phone) === formattedPhoneNumber);

    if (!contact) {
      setError('Contact not found.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/make-call', {
        contact,
        reason: callReason, // Include the call reason here
        twilioNumber: selectedTwilioNumber,
      });
      alert('Call initiated successfully!');
      console.log('Response from API:', response.data);
    } catch (error) {
      console.error('Error initiating call:', error);
      setError('Failed to initiate call.');
    } finally {
      setLoading(false);
    }
  };

  const buttons = [
    { value: '1', letters: '' },
    { value: '2', letters: 'ABC' },
    { value: '3', letters: 'DEF' },
    { value: '4', letters: 'GHI' },
    { value: '5', letters: 'JKL' },
    { value: '6', letters: 'MNO' },
    { value: '7', letters: 'PQRS' },
    { value: '8', letters: 'TUV' },
    { value: '9', letters: 'WXYZ' },
    { value: '*', letters: '' },
    { value: '0', letters: '+' },
    { value: '#', letters: '' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="mb-4 text-3xl font-mono">{input || 'Enter Number'}</div>
      <div className="grid grid-cols-3 gap-4 w-64">
        {buttons.map((button) => (
          <button
            key={button.value}
            onClick={() => handleButtonClick(button.value)}
            className="flex flex-col items-center justify-center h-20 w-20 bg-gray-800 rounded-full text-2xl focus:outline-none"
          >
            {button.value}
            <span className="text-xs">{button.letters}</span>
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="flex flex-col items-center justify-center h-20 w-20 bg-gray-800 rounded-full text-2xl focus:outline-none"
        >
          ⌫
        </button>
        <button
          onClick={handleCall}
          className="flex flex-col items-center justify-center h-20 w-20 bg-green-600 rounded-full text-2xl focus:outline-none"
          disabled={loading}
        >
          {loading ? 'Calling...' : '📞'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-6 w-64">
        <label className="block mb-2">
          <span className="block text-gray-400">Select Twilio Number:</span>
          <select
            value={selectedTwilioNumber}
            onChange={(e) => setSelectedTwilioNumber(e.target.value)}
            className="p-2 border rounded-lg w-full bg-gray-800 text-white"
          >
            {twilioNumbers.map((number) => (
              <option key={number.sid} value={number.phoneNumber}>
                {number.phoneNumber}
              </option>
            ))}
          </select>
        </label>
        <label className="block mt-4">
          <span className="block text-gray-400">Reason for Call:</span>
          <input
            type="text"
            value={callReason}
            onChange={(e) => setCallReason(e.target.value)}
            className="p-2 border rounded-lg w-full bg-gray-800 text-white"
            placeholder="Enter reason for the call"
          />
        </label>
      </div>
    </div>
  );
};

export default Dialer;
