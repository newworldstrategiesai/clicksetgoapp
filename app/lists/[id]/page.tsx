//lists/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContactsTable from '@/components/ContactsTable'; // Adjust the import path as necessary

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

const ListPage = ({ params }: { params: { id: string } }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [listName, setListName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = params;

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/lists/${id}/contacts`);
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        setContacts(data.contacts);
        setListName(data.listName);
      } catch (error) {
        setError('Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [id]);

  const handleContactClick = (contact: Contact) => {
    // Handle contact click
    console.log('Contact clicked:', contact);
  };

  const handlePhoneClick = (contact: Contact) => {
    // Handle phone click
    console.log('Phone clicked:', contact);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="mb-32 bg-black text-white">
      <div className="fixed top-0 left-0 w-full bg-black text-white py-4 z-10">
        <div className="max-w-6xl px-4 py-2 mx-auto sm:px-6 sm:pt-24 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            {listName}
          </h1>
        </div>
      </div>
      <div className="pt-24"> {/* Add padding to avoid overlap with fixed header */}
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h2 className="text-3xl font-bold">Contacts</h2>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="mt-4 p-2 rounded border border-gray-600 bg-gray-900 text-white"
            />
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ContactsTable
              contacts={filteredContacts} // Use filtered contacts
              onContactClick={handleContactClick}
              onCallClick={handlePhoneClick}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ListPage;
