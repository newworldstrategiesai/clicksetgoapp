"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "@/components/AddContactModal";
import ContactDetailsModal from "@/components/ContactDetailsModal";
import CallModal from "@/components/CallModal";
import ListsTable from "@/components/ListsTable";
import CreateListModal from "@/components/CreateListModal";
import ContactsTable from "@/components/ContactsTable";
import { supabase } from "@/utils/supabaseClient";

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

interface ContactsProps {
  userId: string;
  selectedContactsForList?: Set<string>;
}

const Contacts: React.FC<ContactsProps> = ({ userId, selectedContactsForList = new Set() }) => {
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
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");

  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase.from('contacts').select('*').eq('user_id', userId);
        if (error) {
          throw error;
        }
        const parsedContacts = data.map((contact: Contact) => ({
          ...contact,
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          phone: contact.phone.startsWith("+") ? contact.phone : `+${contact.phone.replace(/[^0-9]/g, "")}`,
        }));
        setContacts(parsedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setError("Error fetching contacts.");
      }
    };

    const fetchLists = async () => {
      try {
        const { data, error } = await supabase.from('lists').select('*').eq('user_id', userId);
        if (error) {
          throw error;
        }
        setLists(data);
      } catch (error) {
        console.error("Error fetching lists:", error);
        setError("Error fetching lists.");
      }
    };

    const fetchTwilioNumbers = async () => {
      try {
        const response = await fetch("/api/get-twilio-numbers");
        const twilioNumbersData = await response.json();
        setTwilioNumbers(twilioNumbersData.allNumbers || []);
      } catch (error) {
        console.error("Error fetching Twilio numbers:", error);
        setError("Error fetching Twilio numbers.");
      }
    };

    fetchContacts();
    fetchLists();
    fetchTwilioNumbers();
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

  const closeCallModal = () => setCallModalIsOpen(false);

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
      setSuccessMessage("");
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
        setSuccessMessage("Call initiated successfully!");
        setError("");
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
    if (!name.trim() || selectedContacts.size === 0) {
      setError("Please provide a list name and select at least one contact.");
      return;
    }

    const selectedContactArray = Array.from(selectedContacts);

    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch("/api/create-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contacts: selectedContactArray }),
      });

      const data = await response.json();
      if (response.ok) {
        setLists((prevLists) => [
          ...prevLists,
          { id: data.id, name, contactsCount: selectedContactArray.length },
        ]);
        setSuccessMessage("List created successfully!");
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

  const handleSelectList = (listId: string) => {
    router.push(`/lists/${listId}`);
  };

  const handleDelete = async (contactId: string) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch(`/api/delete-contact?id=${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts((prevContacts) => prevContacts.filter(contact => contact.id !== contactId));
        setSuccessMessage("Contact deleted successfully!");
      } else {
        setError("Failed to delete contact.");
      }
    } catch (error) {
      setError("Failed to delete contact.");
    } finally {
      setLoading(false);
      closeContactDetailsModal();
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.first_name?.toLowerCase().includes(searchQuery) || '') ||
      (contact.last_name?.toLowerCase().includes(searchQuery) || '') ||
      contact.phone.includes(searchQuery)
  );

  const handleUploadRedirect = () => {
    router.push("/upload-contacts");
  };

  return (
    <div className="p-4">
      {successMessage && <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">{successMessage}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-center md:justify-between">
        <div className="flex flex-row space-x-4 mb-4 md:mb-0">
          <button onClick={openCreateListModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Create New List
          </button>
          <button onClick={openNewContactModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Add New Contact
          </button>
          <button onClick={handleUploadRedirect} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Upload
          </button>
        </div>
        <input
          type="text"
          placeholder="Search contacts"
          onChange={handleSearch}
          className="p-2 border rounded-lg w-full md:w-auto"
        />
      </div>

      {activeTab === "contacts" && (
        <ContactsTable
          contacts={filteredContacts}
          onContactClick={openContactDetailsModal}
          onCallClick={openCallModal}
          searchQuery={searchQuery}
          selectedContacts={selectedContactsForList}
        />
      )}
      {activeTab === "lists" && (
        <ListsTable
          lists={lists}
          onSelectList={handleSelectList}
          onOpenNewContactModal={openNewContactModal}
          userId={userId}
          contacts={contacts}
        />
      )}

      <CreateListModal
        isOpen={createListModalIsOpen}
        onClose={closeCreateListModal}
        onSave={handleSaveList}
        selectedContactsForList={selectedContactsForList}
        userId={userId}
      />

      <AddContactModal 
        isOpen={newContactModalIsOpen} 
        onClose={closeNewContactModal} 
        onContactAdded={(newContact) => setContacts((prevContacts) => [...prevContacts, newContact])}
        userId={userId} 
      />

      <ContactDetailsModal 
        isOpen={detailsModalIsOpen} 
        onClose={closeContactDetailsModal} 
        contact={selectedContact} 
        onContactDeleted={handleDelete} 
      />

      <CallModal
        isOpen={callModalIsOpen}
        onClose={closeCallModal}
        selectedContact={selectedContact}
        selectedTwilioNumber={selectedTwilioNumber}
        setSelectedTwilioNumber={setSelectedTwilioNumber}
        callReason={callReason}
        setCallReason={setCallReason}
        handleCallNow={handleCallNow}
        error={error}
        loading={loading}
        twilioNumbers={twilioNumbers}
      />
    </div>
  );
};

export default Contacts;
