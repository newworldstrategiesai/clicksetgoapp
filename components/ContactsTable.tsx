// components/ContactsTable.tsx

'use client';

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faStar,
  faClock,
  faUser,
  faTh,
  faVoicemail,
} from "@fortawesome/free-solid-svg-icons";
import AddToListModal from "@/components/AddToListModal";
import Link from "next/link";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  userId: string;
  onContactClick: (contact: Contact) => void;
  onCallClick: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddToList: (selectedContacts: string[], listId: string) => void;
  onSelectContact?: (contactId: string) => void;
  selectedContacts: Set<string>;
  onToggleSelectContact: (contactId: string) => void; // New prop
  onSelectAll: () => void; // New prop
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  userId,
  onContactClick,
  onCallClick,
  searchQuery = "",
  onSearchChange,
  onAddToList,
  onSelectContact,
  selectedContacts,
  onToggleSelectContact, // Destructure the new prop
  onSelectAll, // Destructure the new prop
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle search filtering
  const lowercasedQuery = searchQuery.toLowerCase();
  const filteredContacts = contacts.filter((contact) => {
    const firstName = contact.first_name || "";
    const lastName = contact.last_name || "";
    const phone = contact.phone || "";

    return (
      firstName.toLowerCase().includes(lowercasedQuery) ||
      lastName.toLowerCase().includes(lowercasedQuery) ||
      phone.includes(lowercasedQuery)
    );
  });

  // Group contacts by the first letter of their first name
  const groupedContacts = filteredContacts.reduce(
    (acc: Record<string, Contact[]>, contact) => {
      const firstLetter = (contact.first_name || "").charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    },
    {}
  );

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    onSelectAll();
  };

  // Toggle individual contact selection
  const toggleSelectContact = (contactId: string) => {
    onToggleSelectContact(contactId);
  };

  // Handle "Go" button click to add selected contacts to a list
  const handleGoClick = () => {
    if (selectedContacts.size > 0) {
      setIsModalOpen(true);
    } else {
      alert("Please select at least one contact.");
    }
  };

  // Handle adding selected contacts to a specific list
  const handleAddToList = (listId: string) => {
    onAddToList(Array.from(selectedContacts), listId);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* Header with "+" button */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
        <Link href="/lists">
          <button className="text-blue-500 text-lg">Lists</button>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectContact && onSelectContact("new")}
            className="text-blue-500 text-lg"
            aria-label="Add Contact"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full p-2 rounded bg-gray-800 dark:text-white"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Select All and Go Button */}
      <div className="flex justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
            onChange={handleSelectAll}
          />
          <label className="text-gray-400">Select All</label>
        </div>
        <button className="p-2 bg-blue-500 dark:text-white rounded" onClick={handleGoClick}>
          Go
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-grow overflow-y-auto">
        {Object.keys(groupedContacts)
          .sort()
          .map((letter) => (
            <div key={letter} className="p-4">
              <h2 className="text-gray-500 text-sm mb-2">{letter}</h2>
              {groupedContacts[letter].map((contact: Contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between py-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                    selectedContacts.has(contact.id) ? "bg-gray-800" : ""
                  }`}
                  onClick={() => onContactClick(contact)} // This should remain
                >
                  <div className="flex items-center w-full">
                    {/* Checkbox at the start */}
                    <div onClick={(e) => e.stopPropagation()} className="mr-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="cursor-pointer"
                      />
                    </div>
                    {/* Avatar */}
                    <div className="bg-gray-600 h-10 w-10 rounded-full mr-3 flex items-center justify-center dark:text-white text-lg">
                      {contact.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-gray-400">{contact.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallClick(contact);
                    }}
                    className="p-2 bg-green-600 rounded dark:text-white hover:bg-green-500 transition-colors"
                  >
                    📞
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToList={handleAddToList}
        userId={userId}
      />
    </div>
  );
};

export default ContactsTable;
