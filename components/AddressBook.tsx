import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface AddressBookProps {
  userId: string;
  onContactSelect: (phone: string) => void;
}

const AddressBook: React.FC<AddressBookProps> = ({ userId, onContactSelect }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }

      setContacts(data || []);
    };

    fetchContacts();
  }, [userId]);

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg overflow-y-auto">
      <input
        type="text"
        placeholder="Search contacts"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-2 w-full bg-gray-900 dark:text-white rounded mb-4 border border-gray-600"
      />
      {filteredContacts.length > 0 ? (
        <ul>
          {filteredContacts.map((contact) => (
            <li
              key={contact.id}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer mb-2"
              onClick={() => onContactSelect(contact.phone)}
            >
              {contact.first_name} {contact.last_name} - {contact.phone}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No contacts found.</p>
      )}
    </div>
  );
};

export default AddressBook;
