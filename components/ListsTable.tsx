// components/ListsTable.tsx
"use client"; // This is a client component

import React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface List {
  id: string;
  name: string;
  contactsCount: number;
}

interface ListsTableProps {
  lists: List[];
}

const ListsTable: React.FC<ListsTableProps> = ({ lists }) => {
  const router = useRouter();

  const handleSelectList = (listId: string) => {
    router.push(`/lists/${listId}`);
  };

  return (
    <div className="w-full max-w-5xl overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Lists</h2>
        <button onClick={() => console.log('Open new list modal')} className="text-blue-500">
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </button>
      </div>
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
                {/* Placeholder for future actions */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListsTable;
