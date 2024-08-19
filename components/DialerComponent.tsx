"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import VoiceDropdown from './VoiceDropdown'; // Adjust the import path as needed
import { ToastContainer, toast } from 'react-toastify'; // Import Toast components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

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

const DialerComponent = ({ userId }: { userId: string }) => {
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>(DEFAULT_TWILIO_NUMBER);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [callReason, setCallReason] = useState('');
  const [firstMessage, setFirstMessage] = useState(''); // Initialize as an empty string
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'existing' | 'new'>('existing');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]); // Initialize the voices state
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch Twilio numbers and contacts on component mount
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
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
        const { data, error } = await supabase.from('contacts').select('*').eq('user_id', userId);
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
  }, [userId]);

  const handleButtonClick = (value: string) => {
    setInput(prevInput => prevInput + value);
  };

  const handleBackspace = () => {
    setInput(prevInput => prevInput.slice(0, -1));
  };

  const handleCall = async () => {
    if (!input) {
      toast.error('Please enter a number.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input);
    const contact = contacts.find(contact => formatPhoneNumber(contact.phone) === formattedPhoneNumber);

    if (contact) {
      setSelectedContact(contact);
      setNewFirstName(contact.first_name); // Pre-populate first name
      setNewLastName(contact.last_name);   // Pre-populate last name
      setModalMode('existing');
    } else {
      setSelectedContact(null);
      setNewFirstName('');
      setNewLastName('');
      setModalMode('new');
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!newFirstName || !callReason || !input) {
      toast.error('Please fill in the first name, phone number, and reason for calling.');
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
          last_name: newLastName || '', // Optional field
          phone: formattedPhoneNumber,
        },
        reason: callReason,
        firstMessage: firstMessage || undefined, // Optional field
        twilioNumber: twilioNumberToUse,
        voiceId: selectedVoice, // Pass the selected voice ID
      });
      toast.success(`Call to ${newFirstName} ${newLastName || ''} initialized.`);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call.');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleContactClick = (contact: Contact) => {
    const formattedPhoneNumber = formatPhoneNumber(contact.phone);
    setInput(formattedPhoneNumber || '');
    setNewFirstName(contact.first_name);
    setNewLastName(contact.last_name);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.first_name?.toLowerCase().includes(searchQuery) || '') ||
      (contact.last_name?.toLowerCase().includes(searchQuery) || '') ||
      contact.phone.includes(searchQuery)
  );

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      <div className="flex flex-col items-center justify-center md:w-1/2">
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
      </div>

      {/* Address Book Panel */}
      <div className="flex flex-col md:w-1/2 p-4 bg-gray-800 h-screen overflow-y-auto">
        <input
          type="text"
          placeholder="Search contacts"
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 mb-4 border rounded-lg w-full bg-gray-700 text-white"
        />
        {filteredContacts.length > 0 ? (
          <ul>
            {filteredContacts.map((contact) => (
              <li
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className="p-2 mb-2 cursor-pointer hover:bg-gray-700 rounded"
              >
                {contact.first_name} {contact.last_name} - {contact.phone}
              </li>
            ))}
          </ul>
        ) : (
          <p>No contacts found.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded w-80">
            <h2 className="text-lg font-bold mb-4">
              {modalMode === 'existing' ? `Calling ${selectedContact?.first_name} ${selectedContact?.last_name}` : 'New Contact'}
            </h2>
            <>
              <div className="mb-4">
                <label className="block mb-1">First Name:</label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Last Name (Optional):</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Phone Number:</label>
                <div className="w-full p-2 bg-gray-700 rounded border border-gray-600">
                  {input || 'Enter Number'}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Reason for Calling:</label>
                <input
                  type="text"
                  value={callReason}
                  onChange={(e) => setCallReason(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">First Message (Optional):</label>
                <input
                  type="text"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="Enter your first message"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Voice:</label>
                <div className="w-full p-2 bg-gray-700 rounded border border-gray-600">
                  {selectedVoice ? voices.find(voice => voice.voice_id === selectedVoice)?.name : 'No voice selected'}
                </div>
              </div>
            </>
            <div className="flex justify-between">
              <button
                onClick={handleModalSubmit}
                className="w-full bg-blue-600 p-2 rounded text-white mr-2"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Call Now'}
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-gray-600 p-2 rounded text-white ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialerComponent;
