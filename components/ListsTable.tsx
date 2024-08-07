import React, { useState } from "react";
import AddContactModal from "@/components/AddContactModal"; // Adjust path as needed
import { Contact, List } from "@/utils/types"; // Ensure consistent import

interface ListsTableProps {
  lists: List[];
  onSelectList: (listId: string) => void;
  onOpenNewContactModal: () => void;
  onAddContacts: (listId: string, contacts: Contact[]) => void;
  onSelectContact?: (contactId: string) => void;
}

const ListsTable: React.FC<ListsTableProps> = ({
  lists,
  onSelectList,
  onOpenNewContactModal,
  onAddContacts,
  onSelectContact,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleOpenModal = (listId: string) => {
    setSelectedListId(listId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListId(null);
  };

  const handleAddContacts = (listId: string, contacts: Contact[]) => {
    onAddContacts(listId, contacts);
    handleCloseModal();
  };

  const handleSelectContact = (contactId: string) => {
    if (onSelectContact) {
      onSelectContact(contactId);
    }
  };

  return (
    <div>
      <button
        onClick={onOpenNewContactModal}
        className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
      >
        Add New Contact
      </button>
      <table className="min-w-full divide-y divide-gray-200 bg-gray-800 text-white shadow-md rounded-lg">
        <thead>
          <tr className="hidden md:table-row">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacts Count</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {lists.map(list => (
            <tr key={list.id} className="hover:bg-gray-700 transition-colors duration-200">
              <td className="px-6 py-4 text-sm text-gray-300">{list.id}</td>
              <td className="px-6 py-4 text-sm text-gray-300">{list.name}</td>
              <td className="px-6 py-4 text-sm text-gray-300">{list.contactsCount}</td>
              <td className="px-6 py-4 text-sm font-medium flex gap-2">
                <button
                  onClick={() => onSelectList(list.id)}
                  className="text-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 transition duration-150"
                >
                  View
                </button>
                <button
                  onClick={() => handleOpenModal(list.id)}
                  className="text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md px-2 py-1 transition duration-150"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => handleSelectContact(list.id)} // Example usage of onSelectContact
                  className="text-yellow-400 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md px-2 py-1 transition duration-150"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedListId && (
        <AddContactModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddContacts={handleAddContacts} // Ensure this matches (listId: string, contacts: Contact[]) => void
          listId={selectedListId} // Pass the selected list ID here
        />
      )}
    </div>
  );
};

export default ListsTable;
