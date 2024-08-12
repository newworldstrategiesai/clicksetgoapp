"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import VoiceDropdown from './VoiceDropdown'; // Adjust the import path as needed

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

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

const DEFAULT_TWILIO_NUMBER = '+19014102020';

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string) => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US'); // Set default region if needed
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

// Fetch voices from Eleven Labs API
const fetchVoices = async (): Promise<Voice[]> => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      },
    });
    return response.data.voices || [];
  } catch (error) {
    throw new Error('Failed to fetch voices');
  }
};

const DialerComponent = () => {
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
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    // Fetch Twilio numbers and contacts on component mount
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        console.log('Twilio Numbers Response:', response.data); // Debugging line
        setTwilioNumbers(response.data.allNumbers || []);
        if (response.data.allNumbers && response.data.allNumbers.length > 0) {
          setSelectedTwilioNumber(response.data.allNumbers[0].phoneNumber);
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

    const fetchVoiceData = async () => {
      try {
        const voicesData = await fetchVoices();
        setVoices(voicesData);
        if (voicesData.length > 0) {
          setSelectedVoice(voicesData[0].voice_id);
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      }
    };

    fetchTwilioNumbers();
    fetchContacts();
    fetchVoiceData();
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
      setNotification('Please fill in the first name and optionally the last name.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input);
    const twilioNumberToUse = selectedTwilioNumber || DEFAULT_TWILIO_NUMBER;

    try {
      setLoading(true);
      const response = await axios.post('/api/make-call', {
        contact: {
          id: selectedContact?.id || '',
          first_name: newFirstName,
          last_name: newLastName || '',
          phone: formattedPhoneNumber,
        },
        reason: callReason,
        twilioNumber: twilioNumberToUse,
        voice: {
          voice_id: selectedVoice, // Pass the voice ID as an object
        },
      });
      setNotification(`Call to ${newFirstName} ${newLastName || ''} initialized.`);
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
            className="w-full mt-1 p-2 bg-gray-800 rounded border border-gray-700"
          >
            {twilioNumbers.map((twilioNumber) => (
              <option key={twilioNumber.sid} value={twilioNumber.phoneNumber}>
                {twilioNumber.phoneNumber}
              </option>
            ))}
          </select>
        </label>
        <VoiceDropdown voices={voices} selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded w-80">
            <h2 className="text-lg font-bold mb-4">
              {modalMode === 'existing' ? `Calling ${selectedContact?.first_name} ${selectedContact?.last_name}` : 'New Contact'}
            </h2>
            {modalMode === 'existing' ? (
              <>
                <div className="mb-4">
                  <label className="block mb-1">Reason for Calling:</label>
                  <input
                    type="text"
                    value={callReason}
                    onChange={(e) => setCallReason(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block mb-1">First Name:</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Last Name:</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Reason for Calling:</label>
                  <input
                    type="text"
                    value={callReason}
                    onChange={(e) => setCallReason(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  />
                </div>
              </>
            )}
            <button
              onClick={handleModalSubmit}
              className="w-full bg-blue-600 p-2 rounded text-white"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Call Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialerComponent;
