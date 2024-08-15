import React, { useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabase } from '@/utils/supabaseClient';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_address?: string;
  user_id: string;
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (contact: Contact) => void; // Ensure this prop name matches
  userId: string;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onContactAdded, userId }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const formatPhoneNumber = (phoneNumber: string) => {
    const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
    return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
  };

  const handleAddContact = async () => {
    if (!firstName || !lastName || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      setError("Invalid phone number format.");
      return;
    }

    const newContactId = crypto.randomUUID();

    const newContact: Contact = {
      id: newContactId,
      first_name: firstName,
      last_name: lastName,
      phone: formattedPhone,
      email_address: email || "",
      user_id: userId,
    };

    try {
      const { error: supabaseError } = await supabase
        .from('contacts')
        .insert([newContact]);

      if (supabaseError) {
        setError("Failed to add contact to database.");
        console.error("Failed to add contact:", supabaseError);
        return;
      }

      // Call the parent callback to add the contact to the local state if needed
      onContactAdded(newContact);
      onClose();
    } catch (error) {
      setError("Unexpected error occurred.");
      console.error("Unexpected error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-white">Add New Contact</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddContact();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
