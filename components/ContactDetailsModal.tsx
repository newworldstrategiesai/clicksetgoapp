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
  email_address?: string;
  linkedin?: string;
  position?: string;
  company?: string;
  company_phone?: string;
  website?: string;
  domain?: string;
  facebook?: string;
  twitter?: string;
  linkedin_company_page?: string;
  country?: string;
  state?: string;
  vertical?: string;
  sub_category?: string;
  notes?: string;
  user_id: string;
}

interface List {
  id: string;
  name: string;
}

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void; // Renamed from onRequestClose
  contact: Contact | null;
  onContactDeleted: (contactId: string) => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onClose, // Renamed from onRequestClose
  contact,
  onContactDeleted,
}) => {
  const [editedContact, setEditedContact] = useState<Contact | null>(contact);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      if (!contact?.user_id) return;

      try {
        const response = await fetch(`/api/lists?userId=${contact.user_id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching lists');
        }

        if (Array.isArray(data)) {
          setLists(data);
        } else {
          console.error('Data fetched is not an array:', data);
          setLists([]);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
        setLists([]);
      }
    };

    if (isOpen && contact?.user_id) {
      fetchLists();
    }
  }, [isOpen, contact]);

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
          email_address: editedContact.email_address,
          linkedin: editedContact.linkedin,
          position: editedContact.position,
          company: editedContact.company,
          company_phone: editedContact.company_phone,
          website: editedContact.website,
          domain: editedContact.domain,
          facebook: editedContact.facebook,
          twitter: editedContact.twitter,
          linkedin_company_page: editedContact.linkedin_company_page,
          country: editedContact.country,
          state: editedContact.state,
          vertical: editedContact.vertical,
          sub_category: editedContact.sub_category,
          notes: editedContact.notes,
        })
        .eq('id', editedContact.id);

      if (error) throw error;

      onClose(); // Renamed from onRequestClose
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
        onClose(); // Renamed from onRequestClose
      }, 2000);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    if (!contact || !selectedList) return;

    try {
      const { error } = await supabase
        .from('contact_lists')
        .insert([{ contact_id: contact.id, list_id: selectedList }]);

      if (error) throw error;

      alert('Contact added to list successfully!');
    } catch (error) {
      console.error('Error adding contact to list:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Contact Details Modal">
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
              <label className="block mb-2">
                <span className="block text-gray-400">Email:</span>
                <input
                  type="text"
                  name="email_address"
                  value={editedContact.email_address || ''}
                  onChange={handleChange}
                  className="p-2 border rounded-lg w-full"
                />
              </label>
              {/* Add more fields here as needed */}
              
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Add to List:</h3>
                <select
                  value={selectedList || ''}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="p-2 border rounded-lg w-full mb-4"
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
                <button
                  onClick={handleAddToList}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Add to List
                </button>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
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
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  No
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
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
