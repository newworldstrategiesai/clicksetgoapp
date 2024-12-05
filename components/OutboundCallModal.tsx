// components/OutboundCallModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

interface Contact {
  first_name: string;
  last_name: string;
  phone: string;
}

interface OutboundCallModalProps {
  agentName: string;
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'black',
    color: 'white',
  },
};

const OutboundCallModal: React.FC<OutboundCallModalProps> = ({ agentName, agentId, isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callReason, setCallReason] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch contacts from the API endpoint
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  const handleCall = async () => {
    const contact = selectedContact ? contacts.find(c => c.phone === selectedContact) : { first_name: agentName, phone: phoneNumber };

    if (!contact || !callReason) {
      setError('Please provide both phone number/contact and reason for the call.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact, reason: callReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      alert('Call initiated successfully!');
    } catch (error) {
      setError('Failed to initiate call.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Outbound Call Modal"
      style={customStyles}
    >
      <h2 className="text-2xl font-bold mb-4">Call {agentName}</h2>
      <p><strong>Agent ID:</strong> {agentId}</p>
      <select
        value={selectedContact}
        onChange={(e) => setSelectedContact(e.target.value)}
        className="w-full p-2 mt-4 border rounded-lg text-black"
      >
        <option value="">Select a contact</option>
        {contacts.map(contact => (
          <option key={contact.phone} value={contact.phone}>
            {contact.first_name} {contact.last_name} - {contact.phone}
          </option>
        ))}
      </select>
      <p className="text-center my-2">or</p>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
        className="w-full p-2 mt-4 border rounded-lg text-black"
        disabled={!!selectedContact}
      />
      <textarea
        value={callReason}
        onChange={(e) => setCallReason(e.target.value)}
        placeholder="Reason for calling"
        className="w-full p-2 mt-4 border rounded-lg text-black"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-500 dark:text-white rounded-lg">Cancel</button>
        <button onClick={handleCall} className="px-4 py-2 bg-blue-500 dark:text-white rounded-lg" disabled={loading}>
          {loading ? 'Calling...' : 'Call Now'}
        </button>
      </div>
    </Modal>
  );
};

export default OutboundCallModal;
