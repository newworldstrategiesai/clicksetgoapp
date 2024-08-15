'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PhoneNumber {
  sid: string;
  phoneNumber: string;
}

interface Contact {
  phone: string;
  first_name: string;
  last_name: string;
}

const PhoneNumbersPage = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contact, setContact] = useState<string>('');
  const [manualPhoneNumber, setManualPhoneNumber] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const response = await axios.get<PhoneNumber[]>('/api/get-twilio-numbers');
        setPhoneNumbers(response.data);
      } catch (error) {
        setError('Failed to fetch phone numbers');
      }
    };

    const fetchContacts = async () => {
      try {
        const response = await axios.get<Contact[]>('/api/contacts');
        setContacts(response.data);
      } catch (error) {
        setError('Failed to fetch contacts');
      }
    };

    fetchPhoneNumbers();
    fetchContacts();
  }, []);

  const handleOutboundCall = async () => {
    const selectedContact = contacts.find(c => c.phone === contact);
    const phoneToCall = selectedContact ? selectedContact.phone : manualPhoneNumber;
    const firstName = selectedContact ? selectedContact.first_name : 'User';

    if (!phoneToCall || !reason || !selectedNumber) {
      setError('Please provide a phone number, a reason for the call, and select a Twilio number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/make-call', {
        contact: { phone: phoneToCall, first_name: firstName },
        reason,
        twilioNumber: selectedNumber,
      });
      alert('Call initiated successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('Failed to initiate call');
        console.error('Error initiating call:', error.response?.data || error.message);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-900 text-white">
        <h2 className="text-xl mb-4">Phone Numbers</h2>
        <ul>
          {phoneNumbers.map((number) => (
            <li
              key={number.sid}
              className="p-2 cursor-pointer hover:bg-gray-700"
              onClick={() => setSelectedNumber(number.phoneNumber)}
            >
              {number.phoneNumber}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4">
        {selectedNumber && (
          <div>
            <h2 className="text-2xl mb-4">Outbound Call</h2>
            <div className="mb-4">
              <label className="block mb-1 text-white">Selected Number:</label>
              <input
                type="text"
                value={selectedNumber}
                readOnly
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-white">Select Contact or Enter Phone Number:</label>
              <select
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white mb-2"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              >
                <option value="">Select Contact</option>
                {contacts.map((contact, index) => (
                  <option key={index} value={contact.phone}>
                    {contact.first_name} {contact.last_name} ({contact.phone})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or enter phone number"
                value={manualPhoneNumber}
                onChange={(e) => setManualPhoneNumber(e.target.value)}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-white">Reason for Call:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleOutboundCall}
              className="p-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Calling...' : 'Outbound Call'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneNumbersPage;
