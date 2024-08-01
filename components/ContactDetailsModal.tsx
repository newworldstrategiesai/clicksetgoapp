import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { supabase } from 'utils/supabaseClient';

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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface ContactDetailsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  contact: Contact | null;
  onContactDeleted: (contactId: string) => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  contact,
  onContactDeleted,
}) => {
  const [editedContact, setEditedContact] = useState<Contact | null>(contact);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    setEditedContact(contact);
    setShowDeleteConfirmation(false);
    setDeleteSuccess(false);
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedContact) {
      setEditedContact({ ...editedContact, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!editedContact) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          first_name: editedContact.first_name,
          last_name: editedContact.last_name,
          phone: editedContact.phone,
        })
        .eq('id', editedContact.id);

      if (error) throw error;

      onRequestClose();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contact.id);

      if (error) throw error;

      setLoading(false);
      setDeleteSuccess(true);
      onContactDeleted(contact.id);
      setTimeout(() => {
        setDeleteSuccess(false);
        onRequestClose();
      }, 2000);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} contentLabel="Contact Details Modal">
      <h2 className="text-xl font-bold mb-4">Contact Details</h2>
      {deleteSuccess ? (
        <p>Contact Successfully Deleted</p>
      ) : (
        <>
          {editedContact && (
            <div>
              <label className="block mb-2">
                <span className="block text-gray-400">First Name:</span>
                <input
                  type="text"
                  name="first_name"
                  value={editedContact.first_name}
                  onChange={handleChange}
                  className="p-2 border rounded-lg w-full"
                />
              </label>
              <label className="block mb-2">
                <span className="block text-gray-400">Last Name:</span>
                <input
                  type="text"
                  name="last_name"
                  value={editedContact.last_name}
                  onChange={handleChange}
                  className="p-2 border rounded-lg w-full"
                />
              </label>
              <label className="block mb-2">
                <span className="block text-gray-400">Phone:</span>
                <input
                  type="text"
                  name="phone"
                  value={editedContact.phone}
                  onChange={handleChange}
                  className="p-2 border rounded-lg w-full"
                />
              </label>
              <div className="flex justify-between mt-4">
                <button onClick={() => setShowDeleteConfirmation(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                  Delete
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </div>
          )}
          {showDeleteConfirmation && (
            <Modal
              isOpen={showDeleteConfirmation}
              onRequestClose={() => setShowDeleteConfirmation(false)}
              style={customStyles}
              contentLabel="Delete Confirmation Modal"
            >
              <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
              <div className="flex justify-between mt-4">
                <button onClick={() => setShowDeleteConfirmation(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                  No
                </button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                  Yes
                </button>
              </div>
              {loading && <p>Loading...</p>}
            </Modal>
          )}
        </>
      )}
    </Modal>
  );
};

export default ContactDetailsModal;
