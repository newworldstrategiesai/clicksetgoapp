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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContacts: (listId: string, contacts: Contact[]) => void; // Added onAddContacts prop
  listId: string; // Added listId prop
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContacts,
  listId,
}) => {
  const [contact, setContact] = useState<Contact>({
    id: '',
    first_name: '',
    last_name: '',
    phone: '',
    user_id: '', // Ensure user_id is properly handled
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact({
      ...contact,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddContact = async () => {
    if (!contact.first_name || !contact.phone) return; // Validate required fields

    setLoading(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([contact]);

      if (error) throw error;

      setContacts((prevContacts) => [...prevContacts, contact]);
      setContact({ id: '', first_name: '', last_name: '', phone: '', user_id: '' });
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContacts = () => {
    onAddContacts(listId, contacts); // Notify parent component about the added contacts
    onClose(); // Close the modal
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Add Contact Modal">
      <h2 className="text-xl font-bold mb-4">Add Contacts to List</h2>
      <div>
        <label className="block mb-4">
          <span className="block text-gray-400">First Name:</span>
          <input
            type="text"
            name="first_name"
            value={contact.first_name}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
            placeholder="First Name"
          />
        </label>
        <label className="block mb-4">
          <span className="block text-gray-400">Last Name:</span>
          <input
            type="text"
            name="last_name"
            value={contact.last_name}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
            placeholder="Last Name"
          />
        </label>
        <label className="block mb-4">
          <span className="block text-gray-400">Phone:</span>
          <input
            type="text"
            name="phone"
            value={contact.phone}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
            placeholder="Phone"
          />
        </label>
        <button
          onClick={handleAddContact}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Contact'}
        </button>
        <button
          onClick={handleSaveContacts}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Save Contacts
        </button>
      </div>
    </Modal>
  );
};

export default AddContactModal;
