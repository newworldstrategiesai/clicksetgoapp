"use client";

import React from "react";

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
  email_address?: string;
  user_id: string;
}

interface ListsTableProps {
  lists: List[];
  onSelectList: (listId: string) => void;
  onAddContacts: (listId: string, contacts: Contact[]) => void;
  onOpenNewContactModal: () => void;
  userId: string;
}

const ListsTable: React.FC<ListsTableProps> = ({
  lists,
  onSelectList,
  onAddContacts,
  onOpenNewContactModal,
  userId,
}) => {
  return (
    <div className="w-full max-w-5xl">
      <table className="min-w-full divide-y divide-gray-800">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">List Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contacts Count</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {lists.map((list) => (
            <tr key={list.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{list.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{list.contactsCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => onSelectList(list.id)}
                >
                  View
                </button>
                <button
                  className="ml-4 text-blue-400 hover:text-blue-300"
                  onClick={onOpenNewContactModal}
                >
                  Add Contact
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListsTable;
