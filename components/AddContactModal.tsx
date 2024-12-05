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
    <div className="fixed inset-0 dark:bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">Add New Contact</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddContact();
          }}
          className="space-y-6"
        >
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 dark:text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200"
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
