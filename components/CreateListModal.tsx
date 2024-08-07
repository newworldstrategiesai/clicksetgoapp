import React, { useState } from 'react';
import Modal from 'react-modal';
import { supabase } from '@/utils/supabaseClient';

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
  onClose: () => void; // Updated prop name to onClose
  onSave: (name: string, selectedContacts: Set<string>) => Promise<void>; // Added onSave prop
  selectedContacts: Set<string>; // Added selectedContacts prop
  userId: string; // Ensure userId is included if needed
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedContacts,
  userId
}) => {
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
  };

  const handleCreateList = async () => {
    if (!listName.trim()) return; // Prevent creating empty lists

    setLoading(true);

    try {
      if (!userId) {
        console.error('User ID is not available');
        return;
      }

      await onSave(listName, selectedContacts); // Call onSave with the current listName and selectedContacts

      setSuccessMessage('List created successfully!');
      setListName(''); // Clear input field
      setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Close the modal
      }, 2000);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Create List Modal">
      <h2 className="text-xl font-bold mb-4">Create New List</h2>
      {successMessage ? (
        <p className="text-green-500">{successMessage}</p>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
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
