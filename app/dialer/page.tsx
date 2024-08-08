"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from 'utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js'; // Import the library

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

const DEFAULT_TWILIO_NUMBER = '+19014102020';

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string) => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US'); // You can set the default region if needed
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

const Dialer = () => {
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>(DEFAULT_TWILIO_NUMBER);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [callReason, setCallReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'existing' | 'new'>('existing');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Fetch Twilio numbers and contacts on component mount
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        setTwilioNumbers(response.data);
        if (response.data.length > 0) {
          setSelectedTwilioNumber(response.data[0].phoneNumber);
        }
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
    setInput(prevInput => prevInput + value);
  };

  const handleBackspace = () => {
    setInput(prevInput => prevInput.slice(0, -1));
  };

  const handleCall = async () => {
    if (!input) {
      setNotification('Please enter a number.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input);
    const contact = contacts.find(contact => formatPhoneNumber(contact.phone) === formattedPhoneNumber);

    if (contact) {
      setSelectedContact(contact);
      setModalMode('existing');
      setCallReason('');
      setIsModalOpen(true);
    } else {
      setSelectedContact(null);
      setModalMode('new');
      setNewFirstName('');
      setNewLastName('');
      setCallReason('');
      setIsModalOpen(true);
    }
  };

  const handleModalSubmit = async () => {
    if (modalMode === 'existing' && !callReason) {
      setNotification('Please fill in the reason for calling.');
      return;
    }
    if (modalMode === 'new' && (!newFirstName || !newLastName)) {
      setNotification('Please fill in all fields.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input);
    const twilioNumberToUse = selectedTwilioNumber || DEFAULT_TWILIO_NUMBER;

    try {
      setLoading(true);
      const response = await axios.post('/api/make-call', {
        contact: {
          id: selectedContact?.id || '',
          first_name: selectedContact?.first_name || newFirstName,
          last_name: selectedContact?.last_name || newLastName,
          phone: formattedPhoneNumber, // Use formatted phone number here
        },
        reason: callReason,
        twilioNumber: twilioNumberToUse,
      });
      setNotification(`Call to ${selectedContact?.first_name || newFirstName} ${selectedContact?.last_name || newLastName} initialized.`);
      console.log('Response from API:', response.data);
    } catch (error) {
      console.error('Error initiating call:', error);
      setNotification('Failed to initiate call.');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
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
      {notification && <p className="text-red-500 mt-4">{notification}</p>}
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
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              {modalMode === 'existing' ? 'Update Contact' : 'Add New Contact'}
            </h3>
            {modalMode === 'existing' && selectedContact ? (
              <>
                <p className="text-gray-400">Contact:</p>
                <p className="text-white text-lg">{`${selectedContact.first_name} ${selectedContact.last_name}`}</p>
                <label className="block mb-2 mt-4">
                  <span className="block text-gray-400">Reason for Calling:</span>
                  <input
                    type="text"
                    value={callReason}
                    onChange={(e) => setCallReason(e.target.value)}
                    className="p-2 border rounded-lg w-full bg-gray-700 text-white"
                  />
                </label>
                <button
                  onClick={handleModalSubmit}
                  className="bg-green-600 p-2 rounded-lg text-white mt-4 w-full"
                >
                  Call Now
                </button>
              </>
            ) : (
              <>
                <label className="block mb-2">
                  <span className="block text-gray-400">First Name:</span>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="p-2 border rounded-lg w-full bg-gray-700 text-white"
                  />
                </label>
                <label className="block mb-2 mt-4">
                  <span className="block text-gray-400">Last Name:</span>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="p-2 border rounded-lg w-full bg-gray-700 text-white"
                  />
                </label>
                <label className="block mb-2 mt-4">
                  <span className="block text-gray-400">Reason for Calling:</span>
                  <input
                    type="text"
                    value={callReason}
                    onChange={(e) => setCallReason(e.target.value)}
                    className="p-2 border rounded-lg w-full bg-gray-700 text-white"
                  />
                </label>
                <button
                  onClick={handleModalSubmit}
                  className="bg-green-600 p-2 rounded-lg text-white mt-4 w-full"
                >
                  Call Now
                </button>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-red-600 p-2 rounded-lg text-white mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dialer;
