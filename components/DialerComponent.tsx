// components/DialerComponent.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import VoiceDropdown from './VoiceDropdown';
import ContactsModal from './ContactsModal';
import CallConfirmationModal from './CallConfirmationModal';
import AddCallerIDModal from './AddCallerIDModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faClock,
  faUser,
  faTh,
  faVoicemail,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import './modernSlider.css';
import { DialerComponentProps } from '@/types';
import strict from 'assert/strict';
import { string } from 'zod';

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

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

interface Agent {
  id: string;
  agent_name: string;
  role: string;
  company_name: string;
  prompt: string;
  default_voice: string;
}

const DEFAULT_TWILIO_NUMBER = process.env.NEXT_PUBLIC_TWILIO_NUMBER || '';

// Utility function to format phone numbers
const formatPhoneNumber = (phoneNumber: string, CountryCode: CountryCode ) => {
  if (typeof phoneNumber !== 'string') {
    return null;
  }
// Remove the '+' and keep only the last 10 digits
  const tenDigitNum = phoneNumber.slice(-10);
  const countryCodeObject = { defaultCountry: CountryCode as CountryCode };
  const phoneNumberObject = parsePhoneNumberFromString(tenDigitNum, countryCodeObject);
  console.log(phoneNumberObject?.format('E.164'))
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

// Function to fetch voices from an external API
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

const DialerComponent: React.FC<DialerComponentProps> = ({
  userId,
  apiKey,
  twilioSid,
  twilioAuthToken,
  vapiKey,
  agentName,
  role,
  companyName,
  prompt,
  voiceId,
}) => {
  // State declarations
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>(
    DEFAULT_TWILIO_NUMBER
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [callReason, setCallReason] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Advanced Fields State (Initialized to empty strings)
  const [agentNameState, setAgentNameState] = useState<string>(agentName || '');
  const [roleState, setRoleState] = useState<string>(role || '');
  const [companyNameState, setCompanyNameState] = useState<string>(companyName || '');
  const [promptState, setPromptState] = useState<string>(prompt || '');
  const [voiceIdState, setVoiceIdState] = useState<string>(voiceId || '');

  // State for Add Caller ID Modal
  const [isAddCallerIDModalOpen, setIsAddCallerIDModalOpen] = useState(false);

  // Default agent settings
  const defaultAgentName = agentName;
  const defaultRole = role;
  const defaultCompanyName = companyName;

  // Initialize agents state
  const [agents, setAgents] = useState<Agent[]>([]);

  /**
   * Fetch Twilio Numbers from the backend API
   */
  const fetchTwilioNumbers = useCallback(async () => {
    try {
      const twilioClient = { twilioSid, twilioAuthToken };

      // Send credentials along with userId to the API
      const response = await axios.post('/api/get-twilio-numbers', {
        userId,
        twilioClient,
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
  }, [twilioSid, twilioAuthToken, userId]);

  /**
   * Function to handle adding a new caller ID successfully
   */
  const handleAddCallerIDSuccess = useCallback(() => {
    fetchTwilioNumbers();
    toast.success('Phone number verified successfully!');
  }, [fetchTwilioNumbers]);

  /**
   * Fetch Contacts from Supabase
   */
  const fetchContacts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);
      // sorting Contacts Alphabetically
        if (error) {
          console.error('Error fetching contacts:', error.message);
        } else {
          // Sort contacts alphabetically by first name
          const sortedContacts = data?.sort((a: any, b: any) => {
            const nameA = a.first_name.toLowerCase();
            const nameB = b.first_name.toLowerCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
          });
          setContacts(sortedContacts || []);
        }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error(
        'Failed to fetch contacts. Please refresh the page or try again later.'
      );
    }
  }, [userId]);

  /**
   * Fetch Voice Data from External API
   */
  const fetchVoiceData = useCallback(async () => {
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
  }, [apiKey]);

  /**
   * Fetch Agent Settings from Supabase
   */
  const fetchAgentSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching agent settings:', error);
      } else {
        setAgents(data || []);
        // Optionally, set default agent settings here
        if (data && data.length > 0) {
          const latestAgent = data[0];
          setAgentNameState(latestAgent.agent_name || '');
          setCompanyNameState(latestAgent.company_name || '');
          setRoleState(latestAgent.role || '');
          setPromptState(latestAgent.prompt || '');
          setVoiceIdState(latestAgent.default_voice || '');
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching agent settings:', error);
      setAgents([]); // Ensure agents is an empty array on error
    }
  }, [userId]);

  /**
   * Handle Call Initiation
   */
  const handleCall = useCallback(async () => {
    if (!input) {
      toast.error('Please enter a number.');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input, selectedCountryCode);
    const contact = contacts.find(
      (contact) => formatPhoneNumber(contact.phone, selectedCountryCode) === formattedPhoneNumber
    );

    if (contact) {
      setSelectedContact(contact);
      setNewFirstName(contact.first_name);
      setNewLastName(contact.last_name);
    } else {
      setSelectedContact(null);
      setNewFirstName('');
      setNewLastName('');
    }

    // Agent settings are optional, so we can proceed to open the modal
    setIsCallModalOpen(true);
  }, [input, contacts]);

  /**
   * Handle Key Presses for Dialing
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isCallModalOpen || isAddressBookModalOpen) return;

      const key = event.key;
      if (/^[0-9*#]$/.test(key)) {
        setInput((prevInput) => prevInput + key);
      } else if (key === 'Backspace') {
        setInput((prevInput) => prevInput.slice(0, -1));
      } else if (key === 'Enter') {
        handleCall();
      }
    },
    [isCallModalOpen, isAddressBookModalOpen, handleCall]
  );

  /**
   * Attach Keydown Event Listener
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress as any);
    return () => {
      window.removeEventListener('keydown', handleKeyPress as any);
    };
  }, [handleKeyPress]);

  /**
   * Fetch Data on Component Mount
   */
  useEffect(() => {
    fetchTwilioNumbers();
    fetchContacts();
    fetchVoiceData();
    fetchAgentSettings(); // This will fetch and set agents
  }, [
    fetchTwilioNumbers,
    fetchContacts,
    fetchVoiceData,
    fetchAgentSettings,
  ]);

  /**
   * Handle Button Clicks on Dial Pad
   */
  const handleButtonClick = useCallback((value: string) => {
    setInput((prevInput) => prevInput + value);
  }, []);

  /**
   * Handle Backspace Button Click
   */
  const handleBackspace = useCallback(() => {
    setInput((prevInput) => prevInput.slice(0, -1));
  }, []);

  /**
   * Handle Modal Submission for Call Confirmation
   */
  const handleModalSubmit = useCallback(async () => {
    console.log('Agent Name:', agentNameState);
    console.log('Role:', roleState);
    console.log('Company Name:', companyNameState);
    console.log('Prompt:', promptState);

    if (!newFirstName || !callReason || !input) {
      toast.error(
        'Please fill in the first name, phone number, and reason for calling.'
      );
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(input, selectedCountryCode);
    const twilioNumberToUse = selectedTwilioNumber || DEFAULT_TWILIO_NUMBER;
    const credentials = { twilioSid, twilioAuthToken, vapiKey };

    // Agent settings are optional, so we proceed without checking
    // Log agent settings before making the call
    console.log('Agent Settings to be sent:', {
      agentName: agentNameState,
      role: roleState,
      companyName: companyNameState,
      prompt: promptState,
    });

    try {
      setLoading(true);
      await axios.post('/api/make-call', {
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
        agentSettings: {
          agentName: agentNameState || undefined,
          role: roleState || undefined,
          companyName: companyNameState || undefined,
          prompt: promptState || undefined,
          voiceId: voiceIdState || undefined,
        },
      });
      toast.success(
        `Call to ${newFirstName} ${newLastName || ''} initialized.`
      );
      setIsCallModalOpen(false);
    } catch (error) {
      console.error(
        'Error initiating call:',
        (error as any).response?.data || (error as Error).message
      );
      toast.error(
        'Failed to initiate call: ' +
          ((error as any).response?.data?.message || 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  }, [
    newFirstName,
    callReason,
    input,
    selectedTwilioNumber,
    twilioSid,
    twilioAuthToken,
    vapiKey,
    agentNameState,
    roleState,
    companyNameState,
    promptState,
    selectedContact,
    newLastName,
    firstMessage,
    selectedVoice,
    userId,
    voiceIdState,
  ]);

  /**
   * Handle Modal Cancellation
   */
  const handleCancel = useCallback(() => {
    setIsCallModalOpen(false);
  }, []);

  /**
   * Define Countries and Their Calling Codes
   */
  const countries = {
    US: { code: '+1', name: 'United States' },
    IN: { code: '+91', name: 'India' },
    FR: { code: '+33', name: 'France' },
    DE: { code: '+49', name: 'Germany' },
    ES: { code: '+34', name: 'Spain' },
    IT: { code: '+39', name: 'Italy' },
    
    // Add more countries as needed
  };
    const [selectedCountryCode, setSelectedCountryCode] =
    useState<keyof typeof countries>('US');
  useEffect(()=> {
    const fetchUserCountry = async () => {
      const { data, error } = await supabase
        .from('client_settings')
        .select('default_country_name, default_country_code')
        .eq('user_id', userId)
        .single();
      // setDefaultCountry(data?.default_country_name);
      setSelectedCountryCode(data?.default_country_name)
      setInput(data?.default_country_code)
    };
    fetchUserCountry();
  },[userId])
  

  /**
   * Handle Contact Selection from Address Book
   */
  // const handleContactClick = useCallback((contact: Contact) => {
  //   const formattedPhoneNumber = formatPhoneNumber(contact.phone);
  //   setInput(formattedPhoneNumber || '');
  //   setNewFirstName(contact.first_name);
  //   setNewLastName(contact.last_name);
  //   setIsAddressBookModalOpen(false);
  // }, []);
  const handleContactClick = useCallback((contact: Contact) => {
    const formattedPhoneNumber = formatPhoneNumber(contact.phone, selectedCountryCode); // Pass the selected country code
    setInput(formattedPhoneNumber || '');
    setNewFirstName(contact.first_name);
    setNewLastName(contact.last_name);
    setIsAddressBookModalOpen(false);
  }, [selectedCountryCode]); // Make sure to depend on selectedCountryCode
  

  /**
   * Handle Search Query Changes
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase());
  }, []);

  /**
   * Define Dial Pad Buttons
   */
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

  /**
   * Filtered Contacts Based on Search Query
   */
  const filteredContacts = contacts.filter(
    (contact) =>
      `${contact.first_name} ${contact.last_name}`
        .toLowerCase()
        .includes(searchQuery) || contact.phone.includes(searchQuery)
  );

  /**
   * Handle Number Selection from Dropdown
   */
  const handleNumberSelect = useCallback((number: TwilioNumber) => {
    setSelectedTwilioNumber(number.phoneNumber);
  }, []);

  return (
    <div className="min-h-screen flex dark:bg-black dark:text-white">
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
        } p-4 dark:bg-black h-[80vh] overflow-y-auto transition-width duration-300 scrollable-element fixed w-1/6 top-16`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-4">
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-semibold">Contacts</h2>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {!isSidebarCollapsed && (
          <div className="relative mb-4">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 p-2 border rounded-lg w-full dark:bg-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex items-center p-2 mb-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded transition-colors duration-200"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center dark:text-white font-bold mr-3">
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
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-6l-4 4z"
                  />
                </svg>
                <p className="text-gray-400">No contacts found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel for Dialer */}
      <div className="flex-grow flex flex-col items-center justify-center w-full pt-16 dark:bg-black">
        <div
          className="text-4xl dark:text-white mb-8"
          style={{ fontSize: '2rem' }}
        >
          <div className="w-64 mb-4">
            <select
              value={selectedCountryCode}
              onChange={(e) => {
                const newCountryCode = e.target.value as keyof typeof countries;
                setSelectedCountryCode(newCountryCode);
                setInput(countries[newCountryCode].code); // Reset input with the new calling code
              }}
              className="w-full p-2 dark:bg-black rounded border border-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              style={{ textAlign: 'center', fontSize: '1.2rem' }}
              aria-label="Select Country"
            >
              {Object.keys(countries).map((code) => (
                <option
                  key={code}
                  value={code}
                  style={{ textAlign: 'center', fontSize: '1.2rem' }}
                >
                  {countries[code as keyof typeof countries].name}
                </option>
              ))}
            </select>
          </div>
          {input || 'Enter Number'}
        </div>
        <div className="grid grid-cols-3 gap-4 w-64">
          {buttons.map((button) => (
            <button
              key={button.value}
              onClick={() => handleButtonClick(button.value)}
              className="flex flex-col items-center justify-center h-20 w-20 dark:bg-black rounded-full text-3xl dark:hover:bg-gray-900 hover:bg-gray-200 focus:outline-none transition-colors duration-200 border border-gray-900"
              aria-label={`Dial ${button.value}`}
            >
              {button.value}
              <span className="text-xs text-gray-400">{button.letters}</span>
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="flex flex-col items-center justify-center h-20 w-20 dark:bg-black rounded-full text-3xl dark:hover:bg-gray-900 hover:bg-gray-200 focus:outline-none transition-colors duration-200 border border-gray-900"
            aria-label="Backspace"
          >
            ⌫
          </button>
          <button
            onClick={handleCall}
            className="flex flex-col items-center justify-center h-20 w-20 bg-green-600 rounded-full text-3xl hover:bg-green-500 focus:outline-none transition-colors duration-200"
            disabled={loading}
            aria-label="Initiate Call"
          >
            {loading ? 'Calling...' : '📞'}
          </button>
        </div>
        <div className="mt-6 w-64 pb-24">
          {/* Added padding-bottom to prevent overlap with footer */}
          <label className="block mb-2">
            <span className="block text-gray-400">Select Twilio Number:</span>
            <select
              value={selectedTwilioNumber}
              onChange={(e) => setSelectedTwilioNumber(e.target.value)}
              className="w-full mt-1 p-2 dark:bg-black rounded border border-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              aria-label="Select Twilio Number"
            >
              {twilioNumbers.map((twilioNumber) => (
                <option key={twilioNumber.sid} value={twilioNumber.phoneNumber}>
                  {twilioNumber.phoneNumber}
                </option>
              ))}
            </select>
          </label>
          <VoiceDropdown
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
          {/* Add Verified Caller ID Button */}
          <button
            onClick={() => setIsAddCallerIDModalOpen(true)}
            className="mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
          >
            Add Verified Caller ID
          </button>
        </div>
      </div>

      {/* Modal for Call Confirmation */}
      <CallConfirmationModal
        isOpen={isCallModalOpen}
        onClose={handleCancel}
        modalMode={selectedContact ? 'existing' : 'new'}
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
        agentName={agentNameState}
        setAgentName={setAgentNameState}
        role={roleState}
        setRole={setRoleState}
        companyName={companyNameState}
        setCompanyName={setCompanyNameState}
        prompt={promptState}
        setPrompt={setPromptState}
        defaultAgentName={defaultAgentName}
        defaultRole={defaultRole}
        defaultCompanyName={defaultCompanyName}
        agents={agents} // Pass the agents state here
      />

      {/* Modal for Address Book */}
      {isAddressBookModalOpen && (
        <ContactsModal
          isOpen={isAddressBookModalOpen}
          onClose={() => setIsAddressBookModalOpen(false)}
          contacts={contacts}
          onContactClick={handleContactClick}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      )}

      {/* Add Verified Caller ID Modal */}
      <AddCallerIDModal
        isOpen={isAddCallerIDModalOpen}
        onClose={() => setIsAddCallerIDModalOpen(false)}
        onSuccess={handleAddCallerIDSuccess}
        twilioSid={twilioSid}
        twilioAuthToken={twilioAuthToken}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full -ml-4 bg-white dark:bg-black border-t border-gray-900 flex justify-around py-4 dark:text-white box-border">
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
