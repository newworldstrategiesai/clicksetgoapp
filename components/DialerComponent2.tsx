"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Use for navigation
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faClock, faUser, faTh, faVoicemail } from '@fortawesome/free-solid-svg-icons'; // Icons for nav
import VoiceDropdown from './VoiceDropdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const DEFAULT_TWILIO_NUMBER = process.env.TWILIO_NUMBER || '';

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string) => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

// Fetch voices from Eleven Labs API using the provided API key
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

const DialerComponent = ({ userId, apiKey }: { userId: string, apiKey: string }) => {
  const [input, setInput] = useState('');
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>(DEFAULT_TWILIO_NUMBER);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [callReason, setCallReason] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'existing' | 'new'>('existing');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch Twilio numbers, contacts, and voices on component mount
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
      await axios.post('/api/make-call', {
        contact: {
          id: selectedContact?.id || '',
          first_name: newFirstName,
          last_name: newLastName || '',
          phone: formattedPhoneNumber,
        },
        reason: callReason,
        firstMessage: firstMessage || undefined,
        twilioNumber: twilioNumberToUse,
        voiceId: selectedVoice,
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
    <div className="min-h-screen flex flex-col dark:bg-black dark:text-white">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      <div className="flex flex-col items-center justify-center w-full pt-16">
        <div className="text-4xl dark:text-white mb-8">{input || ''}</div>
        <div className="grid grid-cols-3 gap-4">
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
            📞
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full dark:bg-black border-t border-gray-700 flex justify-around py-4 dark:text-white">
        <Link href="/favorites">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faStar} size="lg" />
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>
        <Link href="/recents">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faClock} size="lg" />
            <span className="text-xs mt-1">Recents</span>
          </div>
        </Link>
        <Link href="/contacts">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faUser} size="lg" />
            <span className="text-xs mt-1">Contacts</span>
          </div>
        </Link>
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
