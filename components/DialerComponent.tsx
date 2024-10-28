'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { faStar, faClock, faUser, faTh, faVoicemail, faSearch } from '@fortawesome/free-solid-svg-icons';

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

const DEFAULT_TWILIO_NUMBER = process.env.TWILIO_NUMBER || '';

const formatPhoneNumber = (phoneNumber: string) => {
  if (typeof phoneNumber !== 'string') {
    return null;
  }
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'IN');
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

const DialerComponent = ({ userId, apiKey, twilioSid, twilioAuthToken, vapiKey }: 
  { userId: string; apiKey: string; twilioSid: string; twilioAuthToken : string; vapiKey: string }) => {
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for collapsing sidebar

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isCallModalOpen || isAddressBookModalOpen) return;

    const key = event.key;
    if (/^[0-9*#]$/.test(key)) {
      setInput(prevInput => prevInput + key);
    } else if (key === 'Backspace') {
      setInput(prevInput => prevInput.slice(0, -1));
    } else if (key === 'Enter') {
      handleCall();
    }
  }, [isCallModalOpen, isAddressBookModalOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const fetchTwilioNumbers = async () => {
      try {
        const twilioClient = { twilioSid, twilioAuthToken };

        // Send credentials along with user_Id to the API
        const response = await axios.post(`/api/get-twilio-numbers`, {
          user_Id: userId,
          twilioClient: twilioClient // Include the credentials data
        });

        // Set the fetched Twilio numbers
        setTwilioNumbers(response.data.allNumbers || []);
        if (response.data.allNumbers && response.data.allNumbers.length > 0) {
          setSelectedTwilioNumber(response.data.allNumbers[0].phoneNumber);
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
    const credentials = { twilioSid, twilioAuthToken, vapiKey };

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
        credentials,
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

  // Filtered Contacts based on Search Query
  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex bg-black text-white">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Left Panel for Address Book */}
      <div
        className={`hidden md:flex flex-col ${
          isSidebarCollapsed ? 'w-16' : 'w-1/3'
        } p-4 bg-black h-screen overflow-y-auto transition-width duration-300`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-4">
          {!isSidebarCollapsed && <h2 className="text-xl font-semibold">Contacts</h2>}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {!isSidebarCollapsed && (
          <div className="relative mb-4">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)} // Use updated function
              className="pl-10 p-2 border rounded-lg w-full bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search contacts"
            />
          </div>
        )}

        {/* Contacts List */}
        {!isSidebarCollapsed && (
          <>
            {filteredContacts.length > 0 ? (
              <ul>
                {filteredContacts.map((contact) => (
                  <li
                    key={contact.id}
                    onClick={() => handleContactClick(contact)}
                    className="flex items-center p-2 mb-2 cursor-pointer hover:bg-gray-900 rounded transition-colors duration-200"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                      {contact.first_name.charAt(0).toUpperCase()}
                      {contact.last_name.charAt(0).toUpperCase()}
                    </div>
                    {/* Contact Info */}
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{`${contact.first_name} ${contact.last_name}`}</p>
                      <p className="text-xs text-gray-400">{contact.phone}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center mt-10">
                <svg
                  className="w-16 h-16 text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-6l-4 4z" />
                </svg>
                <p className="text-gray-400">No contacts found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel for Dialer */}
      <div className="flex-grow flex flex-col items-center justify-center w-full pt-16 bg-black">
        <div className="text-4xl text-white mb-8">{input || 'Enter Number'}</div>
        <div className="grid grid-cols-3 gap-4 w-64">
          {buttons.map((button) => (
            <button
              key={button.value}
              onClick={() => handleButtonClick(button.value)}
              className="flex flex-col items-center justify-center h-20 w-20 bg-black rounded-full text-3xl hover:bg-gray-900 focus:outline-none transition-colors duration-200 border border-gray-900"
            >
              {button.value}
              <span className="text-xs text-gray-400">{button.letters}</span>
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="flex flex-col items-center justify-center h-20 w-20 bg-black rounded-full text-3xl hover:bg-gray-900 focus:outline-none transition-colors duration-200 border border-gray-900"
          >
            ⌫
          </button>
          <button
            onClick={handleCall}
            className="flex flex-col items-center justify-center h-20 w-20 bg-green-600 rounded-full text-3xl hover:bg-green-500 focus:outline-none transition-colors duration-200"
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
              className="w-full mt-1 p-2 bg-black rounded border border-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
      <div className="fixed bottom-0 w-full bg-black border-t border-gray-900 flex justify-around py-4 text-white">
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
