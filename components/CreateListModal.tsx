// components/CreateListModal.tsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { supabase } from '@/utils/supabaseClient'; // Adjust the import path as necessary

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'black',
    color: 'white',
  },
};

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedContacts: string[], listId: string) => Promise<void>;
  selectedContactsForList: Set<string>;
  userId: string;
}

interface ListInsertResponse {
  id: string;
  name: string;
  user_id: string;
  contacts_count: number;
  created_at: string;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedContactsForList,
  userId
}) => {
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      setErrorMessage('Please provide a list name.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Push data to Supabase and select all columns
      const { data, error } = await supabase
        .from('lists')
        .insert([{ name: listName, user_id: userId, contacts_count: selectedContactsForList.size }])
        .select('*') // Retrieve all columns
        .single(); // Expect a single object in the response

      console.log('Insert Response Data:', data);
      console.log('Insert Response Error:', error);

      if (error) {
        throw error;
      }

      // Ensure data is not null and has an 'id'
      if (!data || !data.id) {
        throw new Error('List creation failed: No ID returned.');
      }

      const listId = data.id;

      // Call onSave function with selected contacts and list ID
      await onSave(Array.from(selectedContactsForList), listId);

      setSuccessMessage('List created successfully!');
      setListName(''); // Clear input field
      setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Close the modal
      }, 2000);
    } catch (error: any) {
      console.error('Error creating list:', error);
      setErrorMessage(error.message || 'Error creating list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Create List Modal">
      <h2 className="text-xl font-bold mb-4">Create New List</h2>
      <div className="mb-4">
        <span className="block text-gray-400">User ID:</span>
        <p className="text-white">{userId}</p>
      </div>
      {successMessage ? (
        <p className="text-green-500">{successMessage}</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : (
        <div>
          <label className="block mb-4">
            <span className="block text-gray-400">List Name:</span>
            <input
              type="text"
              value={listName}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
              placeholder="Enter list name"
            />
          </label>
          <button
            onClick={handleCreateList}
            className="px-4 py-2 bg-green-600 dark:text-white rounded-lg"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create List'}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default CreateListModal;
