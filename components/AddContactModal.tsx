"use client";

import React, { useState } from "react";

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
  onContactAdded: (contact: Contact) => void; // Add this line
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onContactAdded }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleAddContact = async () => {
    if (!firstName || !lastName || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const newContact = {
      id: "new-id", // Replace with actual logic for generating ID
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email_address: email,
      user_id: "current-user-id", // Replace with actual user ID
    };

    try {
      // Call API to add contact if needed
      // const response = await fetch('/api/add-contact', { ... });

      onContactAdded(newContact);
      onClose();
    } catch (error) {
      console.error("Failed to add contact:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add New Contact</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddContact();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
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
