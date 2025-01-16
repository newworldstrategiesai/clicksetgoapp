'use client';

import React, { useState, useEffect, use } from 'react';
import ContactsTable from '@/components/ContactsTable'; // Adjust the import path as necessary
import Modal from 'react-modal';
import { supabase } from 'utils/supabaseClient';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface ListPage {
  params: Promise<{ id: string }>; // or adjust based on migration guide details
}

const ListPage = ({ params }: ListPage) => {
  const { id } = use(params);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [listName, setListName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedContactsForList, setSelectedContactsForList] = useState<Set<string>>(new Set()); // Initialize as state
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      console.log(data.user)
      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, [pathname]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value); // Update the search query state
  };

  const handleAddToList = (selectedContacts: string[], listId: string) => {
    // Implement adding contacts to list
    // Example:
    // fetch(`/api/lists/${listId}/add-contacts`, { method: 'POST', body: JSON.stringify({ contacts: selectedContacts }) })
    //   .then(...)
    console.log(`Adding contacts: ${selectedContacts} to list: ${listId}`);
  };

  const handleSelectAll = () => {
    if (selectedContactsForList.size === contacts.length) {
      setSelectedContactsForList(new Set());
    } else {
      const allIds = contacts.map((contact) => contact.id);
      setSelectedContactsForList(new Set(allIds));
    }
  };

  const handleToggleSelectContact = (contactId: string) => {
    setSelectedContactsForList((prevSelected) => {
      const updated = new Set(prevSelected);
      if (updated.has(contactId)) {
        updated.delete(contactId);
      } else {
        updated.add(contactId);
      }
      return updated;
    });
  };

  const handleSelectContact = (contactId: string) => {
    if (contactId === "new") {
      // Open Add Contact Modal or perform another action
      console.log("Open Add Contact Modal");
    } else {
      // Handle other contact selections if needed
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        handleContactClick(contact);
      }
    }
  };

  return (
    <section className="mb-32 dark:bg-black min-h-screen">
      <div className="fixed top-0 left-0 w-full dark:bg-black dark:text-white py-4 z-10">
        <div className="max-w-6xl px-4 py-2 mx-auto sm:px-6 sm:pt-24 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            {listName}
          </h1>
        </div>
      </div>
      <div className="pt-24"> {/* Add padding to avoid overlap with fixed header */}
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
          {/* No search bar and no buttons here as per your requirement */}
        </div>
        <div className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ContactsTable
              contacts={contacts} // Use all contacts as filtering is handled within ContactsTable
              onContactClick={handleContactClick}
              onCallClick={handlePhoneClick}
              onAddToList={handleAddToList}
              searchQuery={searchQuery} // Pass the search query
              onSearchChange={handleSearchChange} // Pass the search change handler
              userId={user ? user.id : ''}  // Pass userId prop to ContactsTable
              selectedContacts={selectedContactsForList} // Pass selected contacts
              onToggleSelectContact={handleToggleSelectContact} // Pass toggle handler
              onSelectAll={handleSelectAll} // Pass select all handler
              onSelectContact={handleSelectContact} // Pass select contact handler
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ListPage;
