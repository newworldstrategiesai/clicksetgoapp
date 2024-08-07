// components/ContactsTable.tsx

import React from "react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onPhoneClick: (contact: Contact) => void;
  searchQuery: string;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onContactClick,
  onPhoneClick,
  searchQuery,
}) => {
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="table-auto w-full text-left">
        <thead>
          <tr>
            <th className="px-4 md:px-6 py-2">Name</th>
            <th className="px-4 md:px-6 py-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.map((contact) => (
            <tr key={contact.id} className="border-t cursor-pointer hover:bg-gray-700">
              <td
                className="px-4 md:px-6 py-2"
                onClick={() => onContactClick(contact)}
              >
                {contact.first_name} {contact.last_name}
              </td>
              <td
                className="px-4 md:px-6 py-2"
                onClick={() => onPhoneClick(contact)}
              >
                {contact.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;
