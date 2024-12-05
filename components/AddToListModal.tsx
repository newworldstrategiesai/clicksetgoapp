import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

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
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
};

interface List {
  id: string;
  name: string;
}

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToList: (listId: string) => void;
  userId: string; // Pass the user ID to the modal
}

const AddToListModal: React.FC<AddToListModalProps> = ({ isOpen, onClose, onAddToList, userId }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists when the modal is open
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch(`/api/lists?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lists');
        }
        const data = await response.json();
        setLists(data);
      } catch (error) {
        setError('Could not fetch lists. Please try again.');
        console.error('Error fetching lists:', error);
      }
    };

    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, userId]);

  const handleSave = () => {
    if (selectedList) {
      onAddToList(selectedList);
      onClose();
    } else {
      alert('Please select a list.');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h2 className="text-xl font-bold mb-4">Add to List</h2>
      {/* Show the user ID for debugging */}
      <p>User ID: {userId}</p>

      {error && <p className="text-red-500">{error}</p>}

      <select
        className="p-2 border rounded-lg w-full mb-4"
        value={selectedList || ''}
        onChange={(e) => setSelectedList(e.target.value)}
      >
        <option value="">Select a list</option>
        {lists.length > 0 ? (
          lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))
        ) : (
          <option value="">No lists available</option>
        )}
      </select>

      <div className="flex justify-between">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 dark:text-white rounded-lg">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 dark:text-white rounded-lg">
          Save
        </button>
      </div>
    </Modal>
  );
};

export default AddToListModal;
