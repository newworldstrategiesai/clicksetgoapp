'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ContactsTable from "./ContactsTable"; // Ensure correct path

interface List {
  id: string;
  name: string;
  contactsCount: number;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface ListsTableProps {
  lists: List[];
  onOpenNewContactModal: () => void;
  userId: string;
  contacts: Contact[];
  onSelectList: (listId: string) => void; // Add this line
}

const ListsTable: React.FC<ListsTableProps> = ({
  lists,
  onOpenNewContactModal,
  userId,
  contacts = [],
  onSelectList, // Add this line
}) => {
  const router = useRouter();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
    onSelectList(listId); // Call the onSelectList function
    router.push(`/lists/${listId}`);
  };

  const handleAddContact = async (listId: string, contactId: string) => {
    try {
      const response = await fetch('/api/add-to-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listId, contactId }),
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error:', result.error);
      } else {
        console.log('Success:', result.message);
        // Optionally update UI or state here
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filter contacts for the selected list
  const selectedContacts = contacts.filter(contact => contact.user_id === selectedListId);

  return (
    <div className="w-full max-w-5xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-800">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider md:px-6 md:py-3">List Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider md:px-6 md:py-3">Contacts Count</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider md:px-6 md:py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {lists.map((list) => (
            <tr
              key={list.id}
              className="cursor-pointer"
              onClick={() => handleSelectList(list.id)}
            >
              <td className="px-4 py-4 text-sm font-medium text-white md:px-6 md:py-4">{list.name}</td>
              <td className="px-4 py-4 text-sm text-gray-400 md:px-6 md:py-4">{list.contactsCount}</td>
              <td className="px-4 py-4 text-right text-sm font-medium md:px-6 md:py-4">
                <button
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => handleAddContact(list.id, 'contact-id')} // Replace 'contact-id' with actual contact ID
                >
                  Add Contact
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedListId && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Contacts in Selected List</h2>
          <ContactsTable
            contacts={selectedContacts}
            onContactClick={() => {}}
            onCallClick={() => {}} // Update to onCallClick
            searchQuery=""
          />
        </div>
      )}
    </div>
  );
};

export default ListsTable;
