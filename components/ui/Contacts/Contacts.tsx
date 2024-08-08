"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "components/AddContactModal";
import ContactDetailsModal from "components/ContactDetailsModal";
import CallModal from "components/CallModal";
import ListsTable from "components/ListsTable";
import CreateListModal from "components/CreateListModal";
import ContactsTable from "components/ContactsTable";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_address?: string;
  user_id: string;
}

interface List {
  id: string;
  name: string;
  contactsCount: number;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

const Contacts = ({ userId }: { userId: string }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [callModalIsOpen, setCallModalIsOpen] = useState(false);
  const [createListModalIsOpen, setCreateListModalIsOpen] = useState(false);
  const [newContactModalIsOpen, setNewContactModalIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>("");
  const [callReason, setCallReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseContacts = await fetch(`/api/contacts?userId=${userId}`);
        const contactsData = await responseContacts.json();
        const parsedContacts = contactsData.map((contact: Contact) => ({
          ...contact,
          phone: contact.phone.startsWith("+") ? contact.phone : `+${contact.phone.replace(/[^0-9]/g, "")}`,
        }));
        setContacts(parsedContacts);

        const responseLists = await fetch(`/api/lists?userId=${userId}`);
        const listsData = await responseLists.json();
        setLists(listsData);

        const responseTwilioNumbers = await fetch("/api/get-twilio-numbers");
        const twilioNumbersData = await responseTwilioNumbers.json();
        setTwilioNumbers(twilioNumbersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data.");
      }
    };

    fetchData();
  }, [userId]);

  const openContactDetailsModal = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailsModalIsOpen(true);
  };

  const closeContactDetailsModal = () => {
    setDetailsModalIsOpen(false);
  };

  const openCallModal = (contact: Contact) => {
    setSelectedContact(contact);
    setCallModalIsOpen(true);
  };

  const closeCallModal = () => {
    setCallModalIsOpen(false);
  };

  const openCreateListModal = () => setCreateListModalIsOpen(true);
  const closeCreateListModal = () => setCreateListModalIsOpen(false);
  const openNewContactModal = () => setNewContactModalIsOpen(true);
  const closeNewContactModal = () => setNewContactModalIsOpen(false);

  const handleCallNow = async () => {
    if (!selectedContact || !callReason || !selectedTwilioNumber) {
      setError("Please provide all required information.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/make-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: selectedContact,
          reason: callReason,
          twilioNumber: selectedTwilioNumber,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Call initiated successfully!");
      } else {
        setError("Failed to initiate call.");
      }
    } catch (error) {
      setError("Failed to initiate call.");
    } finally {
      setLoading(false);
      closeCallModal();
    }
  };

  const handleSaveList = async (name: string, selectedContacts: Set<string>) => {
    if (!name || selectedContacts.size === 0) {
      setError("Please provide a list name and select at least one contact.");
      return;
    }

    const selectedContactArray = Array.from(selectedContacts);

    try {
      setLoading(true);
      const response = await fetch("/api/create-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contacts: selectedContactArray }),
      });

      const data = await response.json();
      if (response.ok) {
        setLists((prevLists) => [...prevLists, { id: data.id, name, contactsCount: selectedContactArray.length }]);
        closeCreateListModal();
      } else {
        setError("Failed to create list.");
      }
    } catch (error) {
      setError("Failed to create list.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(contactId)) {
        updatedSelected.delete(contactId);
      } else {
        updatedSelected.add(contactId);
      }
      return updatedSelected;
    });
  };

  const handleContactAdded = (contact: Contact) => {
    setContacts((prevContacts) => [...prevContacts, contact]);
  };

  const handleContactDeleted = (contactId: string) => {
    setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));
  };

  const handleSelectList = (listId: string) => {
    router.push(`/lists/${listId}`);
  };

  const handleAddContacts = async (listId: string, contacts: Contact[]) => {
    if (!listId || contacts.length === 0) {
      setError("Please provide a valid list ID and contacts.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/add-contacts-to-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, contacts }),
      });

      const data = await response.json();
      if (response.ok) {
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId
              ? { ...list, contactsCount: list.contactsCount + contacts.length }
              : list
          )
        );
      } else {
        setError("Failed to add contacts to list.");
      }
    } catch (error) {
      setError("Failed to add contacts to list.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.user_id === userId &&
      ((contact.first_name && contact.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.last_name && contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        contact.phone.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 md:px-0">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === "contacts" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
            onClick={() => setActiveTab("contacts")}
          >
            Contacts
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === "lists" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
            onClick={() => setActiveTab("lists")}
          >
            Lists
          </button>
        </div>
        {activeTab === "contacts" && (
          <div className="flex flex-col items-center w-full max-w-5xl">
            <ContactsTable
              contacts={filteredContacts}
              onContactClick={openContactDetailsModal}
              onPhoneClick={openCallModal}
              searchQuery={searchQuery}
            />
          </div>
        )}
        {activeTab === "lists" && (
          <div className="flex flex-col items-center w-full max-w-5xl">
            <ListsTable
              lists={lists}
              onSelectList={handleSelectList}
              onAddContacts={handleAddContacts}
              onOpenNewContactModal={openNewContactModal}
              userId={userId}
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={openCreateListModal}
            >
              Create New List
            </button>
          </div>
        )}
      </div>

      <AddContactModal isOpen={newContactModalIsOpen} onClose={closeNewContactModal} onContactAdded={handleContactAdded} />
      <ContactDetailsModal isOpen={detailsModalIsOpen} onClose={closeContactDetailsModal} contact={selectedContact} onContactDeleted={handleContactDeleted} />
      <CallModal
  isOpen={callModalIsOpen}
  onClose={closeCallModal}
  selectedContact={selectedContact}
  selectedTwilioNumber={selectedTwilioNumber}
  setSelectedTwilioNumber={setSelectedTwilioNumber}
  callReason={callReason}
  setCallReason={setCallReason}
  handleCallNow={handleCallNow} // Ensure this matches the prop name
  error={error}
  loading={loading}
  twilioNumbers={twilioNumbers}
/>

<CreateListModal
  isOpen={createListModalIsOpen}
  onClose={closeCreateListModal}
  onSave={handleSaveList} // Updated prop name to onSave
  selectedContacts={selectedContacts}
  userId={userId} // Ensure this is correctly passed
/>

    </div>
  );
};

export default Contacts;
