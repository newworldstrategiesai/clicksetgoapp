import React, { useState } from 'react';
import Modal from 'react-modal';
import { supabase } from 'utils/supabaseClient'; // Adjust the import based on your project structure

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'black',
    color: 'white',
  },
};

interface AddContactModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  userId: string;
  onContactAdded: (contact: Contact) => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onRequestClose, userId, onContactAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveContact = async () => {
    if (!firstName || !lastName || !phone) {
      setError('Please provide all required information.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ first_name: firstName, last_name: lastName, phone, user_id: userId }])
        .select(); // Adding select() to get the data back

      if (error) throw error;

      if (data && data.length > 0) {
        onContactAdded(data[0]);
        onRequestClose();
      } else {
        setError('Failed to add contact. Please try again.');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      setError('Failed to add contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Add New Contact"
    >
      <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
      <label className="block mb-2">
        <span className="block text-gray-400">First Name:</span>
        <input
          type="text"
          className="p-2 border rounded-lg w-full"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>
      <label className="block mb-2">
        <span className="block text-gray-400">Last Name:</span>
        <input
          type="text"
          className="p-2 border rounded-lg w-full"
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      <label className="block mb-2">
        <span className="block text-gray-400">Phone:</span>
        <input
          type="text"
          className="p-2 border rounded-lg w-full"
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleSaveContact}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Contact'}
      </button>
    </Modal>
  );
};

export default AddContactModal;
