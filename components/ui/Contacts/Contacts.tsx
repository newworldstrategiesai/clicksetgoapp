"use client";

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

interface Contact {
  first_name: string;
  last_name: string;
  phone: string;
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

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [callReason, setCallReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch contacts from the API endpoint
    fetch('/api/contacts')
      .then((response) => response.json())
      .then((data) => {
        const parsedContacts = data.map((contact: Contact) => ({
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone.startsWith('+') ? contact.phone : `+${contact.phone.replace(/[^0-9]/g, '')}`
        }));
        setContacts(parsedContacts);
      })
      .catch((error) => {
        console.error('Error fetching contacts:', error);
        setError('Error fetching contacts.');
      });
  }, []);

  const openModal = (contact: Contact) => {
    setSelectedContact(contact);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCallReason('');
    setError('');
  };

  const handleCallNow = async () => {
    if (!selectedContact || !callReason) {
      setError('Please provide a reason for the call.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: selectedContact,
          reason: callReason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Call initiated:', data);
        alert('Call initiated successfully!');
      } else {
        console.error('Failed to initiate call:', data);
        setError('Failed to initiate call.');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      setError('Failed to initiate call.');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 md:px-0">
      <div className="flex flex-col items-center w-full max-w-5xl">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-4xl font-bold">Your Agents Don't Have Anyone To Call Yet :(</h1>
        </div>
        <div className="text-center mb-8">
          <p>No worries! Make your agents happy by uploading contacts that they can call once you launch a campaign.</p>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 md:px-6 py-2">Name</th>
                <th className="px-4 md:px-6 py-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr key={index} className="border-t cursor-pointer hover:bg-gray-700" onClick={() => openModal(contact)}>
                  <td className="px-4 md:px-6 py-2">{contact.first_name} {contact.last_name}</td>
                  <td className="px-4 md:px-6 py-2">{contact.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Call Modal"
        style={customStyles}
      >
        {selectedContact && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Call {selectedContact.first_name} {selectedContact.last_name}</h2>
            <p><strong>Phone:</strong> {selectedContact.phone}</p>
            <textarea
              value={callReason}
              onChange={(e) => setCallReason(e.target.value)}
              placeholder="Reason for calling"
              className="w-full p-2 mt-4 border rounded-lg text-black"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              onClick={handleCallNow}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg mt-4"
              disabled={loading}
            >
              {loading ? 'Calling...' : 'Call Now'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;
