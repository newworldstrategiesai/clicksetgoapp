'use client';

import React from 'react';
import { Contact } from '@/types'; // Ensure this path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onContactClick,
  searchQuery,
  onSearchChange,
}) => {
  if (!isOpen) return null;

  const filteredContacts = contacts.filter(contact => {
    const firstNameMatch = contact.first_name.toLowerCase().includes(searchQuery.toLowerCase());
    const lastNameMatch = contact.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phone.includes(searchQuery);

    return firstNameMatch || lastNameMatch || phoneMatch;
  });

  const handleContactSelect = (contact: Contact) => {
    onContactClick(contact); // Call the passed function to handle contact selection
    onClose(); // Close the modal after selecting the contact
  };

  return (
    <div className="fixed inset-0 dark:bg-black bg-opacity-90 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold dark:text-white">Contacts</h2>
        <button onClick={onClose} className="text-white">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 dark:text-white mb-4" // Updated background color
      />
      <div className="flex-grow overflow-y-auto">
        {filteredContacts.length > 0 ? (
          <ul>
            {filteredContacts.map((contact) => (
              <li
                key={contact.id}
                onClick={() => handleContactSelect(contact)} // Updated to use the new function
                className="flex items-center p-4 cursor-pointer hover:bg-gray-700"
              >
                <div className="bg-gray-600 h-10 w-10 rounded-full mr-3 flex items-center justify-center dark:text-white text-lg">
                  {contact.first_name.charAt(0).toUpperCase()}{contact.last_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg dark:text-white">{contact.first_name} {contact.last_name}</p>
                  <p className="text-gray-400">{contact.phone}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white text-center">No contacts found.</p>
        )}
      </div>
    </div>
  );
};

export default ContactsModal;
