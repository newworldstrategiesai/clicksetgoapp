'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface List {
  id: string;
  name: string;
  contactsCount: number;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

interface FetchContactsResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface FetchListsResponse {
  id: string;
  name: string;
  contactsCount: number;
}

interface FetchTwilioNumbersResponse {
  sid: string;
  phoneNumber: string;
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

const Contacts = ({ userId }: { userId: string }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newListModalIsOpen, setNewListModalIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>('');
  const [callReason, setCallReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [newListName, setNewListName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contacts
        const responseContacts = await fetch(`/api/contacts?userId=${userId}`);
        const contactsData: FetchContactsResponse[] = await responseContacts.json();
        const parsedContacts = contactsData.map((contact) => ({
          ...contact,
          phone: contact.phone.startsWith('+') ? contact.phone : `+${contact.phone.replace(/[^0-9]/g, '')}`,
        }));
        setContacts(parsedContacts);

        // Fetch lists
        const responseLists = await fetch(`/api/lists?userId=${userId}`);
        const listsData: FetchListsResponse[] = await responseLists.json();
        setLists(listsData);

        // Fetch Twilio numbers
        const responseTwilioNumbers = await fetch('/api/get-twilio-numbers');
        const twilioNumbersData: FetchTwilioNumbersResponse[] = await responseTwilioNumbers.json();
        setTwilioNumbers(twilioNumbersData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data.');
      }
    };

    fetchData();
  }, [userId]);

  const openModal = (contact: Contact) => {
    setSelectedContact(contact);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCallReason('');
    setSelectedTwilioNumber('');
    setError('');
  };

  const openNewListModal = () => {
    setNewListModalIsOpen(true);
  };

  const closeNewListModal = () => {
    setNewListModalIsOpen(false);
    setNewListName('');
    setSelectedContacts(new Set());
    setError('');
  };

  const handleCallNow = async () => {
    if (!selectedContact || !callReason || !selectedTwilioNumber) {
      setError('Please provide all required information.');
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
          twilioNumber: selectedTwilioNumber,
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

  const handleSaveList = async () => {
    if (!newListName || selectedContacts.size === 0) {
      setError('Please provide a list name and select at least one contact.');
      return;
    }

    const selectedContactArray = Array.from(selectedContacts);

    try {
      setLoading(true);
      const response = await fetch('/api/create-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newListName,
          contacts: selectedContactArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('List created:', data);
        setLists((prevLists) => [...prevLists, { id: data.id, name: newListName, contactsCount: selectedContactArray.length }]);
        closeNewListModal();
      } else {
        console.error('Failed to create list:', data);
        setError('Failed to create list.');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Failed to create list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(contactId)) {
        updatedSelected.delete(contactId);
      } else {
        updatedSelected.add(contactId);
      }
      return updatedSelected;
    });
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.user_id === userId &&
      (contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 md:px-0">
      <div className="flex justify-between w-full max-w-5xl mb-4">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 ${activeTab === 'contacts' ? 'bg-white text-black' : 'bg-gray-700 text-gray-400'}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'lists' ? 'bg-white text-black' : 'bg-gray-700 text-gray-400'}`}
            onClick={() => setActiveTab('lists')}
          >
            Lists
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={activeTab === 'contacts' ? 'Search Contacts' : 'Search Lists'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg text-black"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={activeTab === 'contacts' ? () => router.push('/upload-contacts') : openNewListModal}
          >
            {activeTab === 'contacts' ? 'Import Contacts' : 'New List'}
          </button>
        </div>
      </div>
      {activeTab === 'contacts' && (
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 md:px-6 py-2">Name</th>
                  <th className="px-4 md:px-6 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr
                    key={index}
                    className="border-t cursor-pointer hover:bg-gray-700"
                    onClick={() => openModal(contact)}
                  >
                    <td className="px-4 md:px-6 py-2">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="px-4 md:px-6 py-2">{contact.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'lists' && (
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 md:px-6 py-2">List Name</th>
                  <th className="px-4 md:px-6 py-2">Contacts Count</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 md:px-6 py-2">{list.name}</td>
                    <td className="px-4 md:px-6 py-2">{list.contactsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Contact Modal"
      >
        <h2 className="text-xl font-bold mb-4">Call Contact</h2>
        {selectedContact && (
          <div>
            <p>
              <strong>Name:</strong> {selectedContact.first_name} {selectedContact.last_name}
            </p>
            <p>
              <strong>Phone:</strong> {selectedContact.phone}
            </p>
            <div className="mt-4">
              <label className="block mb-2">
                <span className="block text-gray-400">Twilio Number:</span>
                <select
                  value={selectedTwilioNumber}
                  onChange={(e) => setSelectedTwilioNumber(e.target.value)}
                  className="p-2 border rounded-lg w-full"
                >
                  <option value="">Select Twilio Number</option>
                  {twilioNumbers.map((number) => (
                    <option key={number.sid} value={number.phoneNumber}>
                      {number.phoneNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-2">
                <span className="block text-gray-400">Call Reason:</span>
                <textarea
                  value={callReason}
                  onChange={(e) => setCallReason(e.target.value)}
                  className="p-2 border rounded-lg w-full"
                />
              </label>
              {error && <p className="text-red-500">{error}</p>}
              <button
                onClick={handleCallNow}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={loading}
              >
                {loading ? 'Calling...' : 'Call Now'}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={newListModalIsOpen}
        onRequestClose={closeNewListModal}
        style={customStyles}
        contentLabel="New List Modal"
      >
        <h2 className="text-xl font-bold mb-4">Create New List</h2>
        <label className="block mb-2">
          <span className="block text-gray-400">List Name:</span>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </label>
        <div className="mb-4">
          <p className="text-gray-400">Select Contacts:</p>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <label key={contact.id} className="block">
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.id)}
                  onChange={() => handleSelectContact(contact.id)}
                  className="mr-2"
                />
                {contact.first_name} {contact.last_name}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleSaveList}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save List'}
        </button>
      </Modal>
    </div>
  );
};

export default Contacts;
