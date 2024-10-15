"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import VoiceDropdown from './VoiceDropdown';
import ContactsModal from './ContactsModal';
import CallConfirmationModal from './CallConfirmationModal'; // Import the new modal
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faClock, faUser, faTh, faVoicemail } from '@fortawesome/free-solid-svg-icons';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string; // Ensure this is included
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

// 19014102020
const DEFAULT_TWILIO_NUMBER = '+13343731975';

const formatPhoneNumber = (phoneNumber: string) => {
  if (typeof phoneNumber !== 'string') {
    return null;
  }
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

const fetchVoices = async (apiKey: string): Promise<Voice[]> => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
    });
    return response.data.voices || [];
  } catch (error) {
    throw new Error('Failed to fetch voices');
  }
};

const DialerComponent = ({ userId, apiKey }: { userId: string; apiKey: string }) => {
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>(DEFAULT_TWILIO_NUMBER);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [callReason, setCallReason] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false); // Modal for Call Confirmation
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false); // Modal for Address Book

  useEffect(() => {
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        setTwilioNumbers(response.data.allNumbers || []);
        if (response.data.allNumbers && response.data.allNumbers.length > 0) {
          setSelectedTwilioNumber(DEFAULT_TWILIO_NUMBER || response.data.allNumbers[0].phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
        toast.error('Failed to fetch Twilio numbers. Please try again later.');
      }
    };

    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', userId); // Ensure you're filtering by user_id
        if (error) throw error;
        setContacts(data); // Now `data` should match the Contact type
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to fetch contacts. Please refresh the page or try again later.');
      }
    };

    const fetchVoiceData = async () => {
      try {
        const voicesData = await fetchVoices(apiKey);
        setVoices(voicesData);
        if (voicesData.length > 0) {
          setSelectedVoice(voicesData[0].voice_id);
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
        toast.error('Failed to fetch voices. Please try again.');
      }
    };

    fetchTwilioNumbers();
    fetchContacts();
    fetchVoiceData();
  }, [userId, apiKey]);

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
      setNewFirstName(contact.first_name);
      setNewLastName(contact.last_name);
    } else {
      setSelectedContact(null);
      setNewFirstName('');
      setNewLastName('');
    }
    setIsCallModalOpen(true);
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
          last_name: newLastName,
          phone: formattedPhoneNumber,
        },
        reason: callReason,
        firstMessage: firstMessage || undefined,
        twilioNumber: twilioNumberToUse,
        voiceId: selectedVoice,
        userId,
      });
      toast.success(`Call to ${newFirstName} ${newLastName || ''} initialized.`);
      setIsCallModalOpen(false); // Close modal after call is initiated
    } catch (error) {
      console.error('Error initiating call:', (error as any).response?.data || (error as Error).message);
      toast.error('Failed to initiate call: ' + ((error as any).response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCallModalOpen(false);
  };

  const handleContactClick = (contact: Contact) => {
    const formattedPhoneNumber = formatPhoneNumber(contact.phone);
    setInput(formattedPhoneNumber || '');
    setNewFirstName(contact.first_name);
    setNewLastName(contact.last_name);
    setIsAddressBookModalOpen(false); // Close the modal upon selection
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value.toLowerCase());
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
    <div className="min-h-screen flex bg-black text-white">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      {/* Left Panel for Address Book */}
      <div className="hidden md:flex md:flex-col md:w-1/3 p-4 bg-gray-800 h-screen overflow-y-auto">
        <input
          type="text"
          placeholder="Search contacts"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)} // Use updated function
          className="p-2 mb-4 border rounded-lg w-full bg-gray-700 text-white"
        />
        {contacts.length > 0 ? (
          <ul>
            {contacts.map((contact) => (
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

      {/* Right Panel for Dialer */}
      <div className="flex-grow flex flex-col items-center justify-center w-full pt-16">
        <div className="text-4xl text-white mb-8">{input || 'Enter Number'}</div>
        <div className="grid grid-cols-3 gap-4 w-64">
          {buttons.map((button) => (
            <button
              key={button.value}
              onClick={() => handleButtonClick(button.value)}
              className="flex flex-col items-center justify-center h-20 w-20 bg-gray-800 rounded-full text-3xl focus:outline-none"
            >
              {button.value}
              <span className="text-xs">{button.letters}</span>
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="flex flex-col items-center justify-center h-20 w-20 bg-gray-800 rounded-full text-3xl focus:outline-none"
          >
            ⌫
          </button>
          <button
            onClick={handleCall}
            className="flex flex-col items-center justify-center h-20 w-20 bg-green-600 rounded-full text-3xl focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Calling...' : '📞'}
          </button>
        </div>
        <div className="mt-6 w-64 pb-24"> {/* Added padding-bottom to prevent overlap with footer */}
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

      {/* Modal for Call Confirmation */}
      <CallConfirmationModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        modalMode={'existing'} // or 'new' based on your logic
        contactName={`${newFirstName} ${newLastName}`}
        handleModalSubmit={handleModalSubmit}
        loading={loading}
        newFirstName={newFirstName}
        setNewFirstName={setNewFirstName}
        newLastName={newLastName}
        setNewLastName={setNewLastName}
        input={input}
        callReason={callReason}
        setCallReason={setCallReason}
        firstMessage={firstMessage}
        setFirstMessage={setFirstMessage}
      />

      {/* Modal for Address Book */}
      {isAddressBookModalOpen && (
        <ContactsModal
          isOpen={isAddressBookModalOpen}
          onClose={() => setIsAddressBookModalOpen(false)}
          contacts={contacts}
          onContactClick={handleContactClick}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange} // This now passes a string
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-black border-t border-gray-700 flex justify-around py-4 text-white">
        <Link href="/favorites">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faStar} size="lg" />
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>
        <Link href="/campaigns">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faClock} size="lg" />
            <span className="text-xs mt-1">Scheduled</span>
          </div>
        </Link>
        {/* Modify to navigate to /contacts in desktop and open modal in mobile */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            if (window.innerWidth >= 768) {
              window.location.href = '/contacts'; // Navigate to /contacts for desktop
            } else {
              setIsAddressBookModalOpen(true); // Open modal for mobile
            }
          }}
        >
          <FontAwesomeIcon icon={faUser} size="lg" />
          <span className="text-xs mt-1">Contacts</span>
        </div>
        <div className="flex flex-col items-center">
          <FontAwesomeIcon icon={faTh} size="lg" />
          <span className="text-xs mt-1">Keypad</span>
        </div>
        <Link href="/call-logs">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faVoicemail} size="lg" />
            <span className="text-xs mt-1">Calls</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DialerComponent;
