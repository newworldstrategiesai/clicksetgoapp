// components/ListsTable.tsx
"use client"; // Ensure this is a client component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from './ui/Modal';
import CreateListModal from './CreateListModal'; // Import CreateListModal
import { supabase } from '@/utils/supabaseClient'; // Ensure correct path

interface List {
  id: string;
  name: string;
  contacts_count: number;
  created_at: string;
  user_id: string;
}

interface ListsTableProps {
  lists: List[];
  userId: string; // Pass userId as prop to handle list creation
}

const ListsTable: React.FC<ListsTableProps> = ({ lists, userId }) => {
  const router = useRouter();
  const [editingList, setEditingList] = useState<{ id: string, name: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, name: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for CreateListModal

  const handleEdit = (e: React.MouseEvent, listId: string, currentName: string) => {
    e.stopPropagation();
    setEditingList({ id: listId, name: currentName });
    setIsEditModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, listId: string, listName: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ id: listId, name: listName });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        const response = await fetch('/api/delete-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId: deleteConfirmation.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete list');
        }

        router.refresh();
        setDeleteConfirmation(null);
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingList) {
      try {
        const response = await fetch('/api/edit-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId: editingList.id, newName: editingList.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to update list');
        }

        router.refresh();
        setIsEditModalOpen(false);
        setEditingList(null);
      } catch (error) {
        console.error('Error updating list:', error);
        alert('Failed to update list. Please try again.');
      }
    }
  };

  const handleSelectList = (listId: string) => {
    router.push(`/lists/${listId}`);
  };

  const handleCreateList = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveCreateList = async (selectedContacts: string[], listId: string) => {
    // Since selectedContacts is empty in this context, simply refresh the list
    router.refresh();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 bg-gray-800">
        <h2 className="text-2xl font-bold text-white">Lists</h2>
        <button 
          onClick={handleCreateList} // Open the create list modal
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          New List
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 ">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">List Name</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Contacts</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {lists.map((list) => (
              <tr
                key={list.id}
                className="hover:bg-gray-800 transition duration-150 ease-in-out cursor-pointer"
                onClick={() => handleSelectList(list.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{list.name}</div>
                  <div className="text-sm text-gray-400">{new Date(list.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-center text-gray-300">{list.contacts_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => handleEdit(e, list.id, list.name)}
                    className="text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out mr-3"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, list.id, list.name)}
                    className="text-red-400 hover:text-red-300 transition duration-150 ease-in-out"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit List Modal */}
      {isEditModalOpen && editingList && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Edit List</h2>
          <input
            type="text"
            value={editingList.name}
            onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4"
          />
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)}>
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p className="mb-4">Are you sure you want to delete the list "{deleteConfirmation.name}"?</p>
          <div className="flex justify-end">
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
      
      {/* Create List Modal */}
      {isCreateModalOpen && (
        <CreateListModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveCreateList}
          selectedContactsForList={new Set()} // Empty set as no contacts are selected in this context
          userId={userId}
        />
      )}
    </div>
  );
};

export default ListsTable;
