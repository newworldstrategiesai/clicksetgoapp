import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStar, faClock, faUser, faTh, faVoicemail } from "@fortawesome/free-solid-svg-icons";
import AddToListModal from "./AddToListModal";
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
  onContactClick: (contact: Contact) => void;
  onCallClick: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddToList: (selectedContacts: string[], listId: string) => void;
  onSelectContact?: (contactId: string) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onContactClick,
  onCallClick,
  searchQuery = "",
  onSearchChange,
  onAddToList,
  onSelectContact,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Group contacts by the first letter of the last name or first name
  const groupedContacts = filteredContacts.reduce((acc: any, contact) => {
    const firstLetter = (contact.last_name || contact.first_name || "").charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  // Toggle Select All
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts(new Set());
    } else {
      const allContactIds = filteredContacts.map((contact) => contact.id);
      setSelectedContacts(new Set(allContactIds));
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual contact selection
  const toggleSelectContact = (contactId: string) => {
    const updatedSelectedContacts = new Set(selectedContacts);
    if (updatedSelectedContacts.has(contactId)) {
      updatedSelectedContacts.delete(contactId);
    } else {
      updatedSelectedContacts.add(contactId);
    }
    setSelectedContacts(updatedSelectedContacts);
  };

  // Handle "Go" button click
  const handleGoClick = () => {
    if (selectedContacts.size > 0) {
      setIsModalOpen(true); // Open the modal to select a list
    } else {
      alert("Please select at least one contact.");
    }
  };

  // Handle adding to list
  const handleAddToList = (listId: string) => {
    onAddToList(Array.from(selectedContacts), listId);
    setIsModalOpen(false); // Close the modal after saving
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      {/* Header with Back button and Add (+) button */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
        <Link href="/lists">
          <button className="text-blue-500 text-lg">Lists</button>
        </Link>
        <h1 className="text-3xl font-bold">Contacts</h1>
        <button className="text-blue-500 text-lg">
          <FontAwesomeIcon icon={faPlus} onClick={() => onSelectContact && onSelectContact("new")} />
        </button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full p-2 rounded bg-gray-800 text-white"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Select All and Actions */}
      <div className="flex justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label className="text-gray-400">Select All</label>
        </div>
        <button className="p-2 bg-blue-500 text-white rounded" onClick={handleGoClick}>
          Go
        </button>
      </div>

      {/* Contacts list */}
      <div className="flex-grow overflow-y-auto">
        {Object.keys(groupedContacts).sort().map((letter) => (
          <div key={letter} className="p-4">
            <h2 className="text-gray-500 text-sm mb-2">{letter}</h2>
            {groupedContacts[letter].map((contact: Contact) => (
              <div
                key={contact.id}
                className={`flex items-center justify-between py-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                  selectedContacts.has(contact.id) ? "bg-gray-800" : ""
                }`}
                onClick={() => onContactClick(contact)}
              >
                <div className="flex items-center">
                  {/* Avatar (placeholder if no image) */}
                  <div className="bg-gray-600 h-10 w-10 rounded-full mr-3 flex items-center justify-center text-white text-lg">
                    {contact.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-gray-400">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => toggleSelectContact(contact.id)}
                    className="mr-2"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the contact
                      onCallClick(contact);
                    }}
                    className="text-blue-500"
                  >
                    📞
                  </button>
                </div>
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
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-black border-t border-gray-700 flex justify-around py-4 text-white z-10">
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
        <Link href="/dialer">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faTh} size="lg" />
            <span className="text-xs mt-1">Keypad</span>
          </div>
        </Link>
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

export default ContactsTable;
