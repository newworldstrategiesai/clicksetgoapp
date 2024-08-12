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
  onCallClick: (contact: Contact) => void;
  searchQuery: string;
  onSelectContact?: (contactId: string) => void; // Optional prop
  selectedContacts?: Set<string>; // Optional prop
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onContactClick,
  onCallClick,
  searchQuery = "",
  onSelectContact, // Add optional prop
  selectedContacts = new Set(), // Add optional prop
}) => {
  const lowercasedQuery = searchQuery.toLowerCase();

  const filteredContacts = contacts.filter((contact) => {
    const firstName = contact.first_name || "";
    const lastName = contact.last_name || "";
    const phone = contact.phone || "";

    return (
      firstName.toLowerCase().includes(lowercasedQuery) ||
      lastName.toLowerCase().includes(lowercasedQuery) ||
      phone.includes(lowercasedQuery)
    );
  });

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
            <tr
              key={contact.id}
              className={`border-t cursor-pointer hover:bg-gray-700 ${selectedContacts?.has(contact.id) ? "bg-gray-800" : ""}`}
            >
              <td
                className="px-4 md:px-6 py-2"
                onClick={() => onContactClick(contact)}
              >
                {contact.first_name} {contact.last_name}
              </td>
              <td
                className="px-4 md:px-6 py-2"
                onClick={() => onCallClick(contact)}
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
