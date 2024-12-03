// components/ui/Contacts/Contacts.tsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "@/components/AddContactModal";
import ContactDetailsModal from "@/components/ContactDetailsModal";
import CallModal from "@/components/CallModal";
import ContactsTable from "@/components/ContactsTable";
import { supabase } from "@/utils/supabaseClient";
import BottomNav from "@/components/BottomNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_address?: string;
  user_id: string;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

interface ContactsProps {
  userId: string;
  onAddToList: (ids: string[], listId: string) => void;
  AllApiKeys: {
    apiKey: string;
    twilioSid: string;
    twilioAuthToken: string;
    vapiKey: string;
  };
}

const Contacts: React.FC<ContactsProps> = ({ userId, onAddToList, AllApiKeys }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [callModalIsOpen, setCallModalIsOpen] = useState(false);
  const [addContactModalIsOpen, setAddContactModalIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>("");
  const [callReason, setCallReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedContactsForList, setSelectedContactsForList] = useState<Set<string>>(new Set());

  // New state for search
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase.from("contacts").select("*").eq("user_id", userId);
        if (error) {
          throw error;
        }
        const parsedContacts = data.map((contact: Contact) => ({
          ...contact,
          first_name: contact.first_name || "",
          last_name: contact.last_name || "",
          phone: contact.phone || "",
          // phone:
          //   contact.phone &&
          //   typeof contact.phone === "string" &&
          //   contact.phone.startsWith("+")
          //     ? contact.phone
          //     : `+${(contact.phone || "").replace(/[^0-9]/g, "")}`,
        }));
        setContacts(parsedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setError("Error fetching contacts.");
      }
    };

    const fetchTwilioNumbers = async () => {
      const twilioClient = {
        twilioSid: AllApiKeys.twilioSid,
        twilioAuthToken: AllApiKeys.twilioAuthToken
      };
      try {
        const response = await fetch("/api/get-twilio-numbers", {
          method: "POST",
          headers: {"content-type": 'application/json'},
          body: JSON.stringify({user_Id: userId, twilioClient:twilioClient})
        });
        const twilioNumbersData = await response.json();
        setTwilioNumbers(twilioNumbersData.allNumbers || []);
      } catch (error) {
        console.error("Error fetching Twilio numbers:", error);
        setError("Error fetching Twilio numbers.");
      }
    };

    fetchContacts();
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

  const openAddContactModal = () => setAddContactModalIsOpen(true);
  const closeAddContactModal = () => setAddContactModalIsOpen(false);

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

  const handleAddContact = (newContact: Contact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  const handleDelete = async (contactId: string) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        throw error;
      }

      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactId)
      );
      setSuccessMessage("Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      setError("Failed to delete contact.");
    } finally {
      setLoading(false);
      closeContactDetailsModal();
    }
  };

  const handleAddToListInternal = (selectedContacts: string[], listId: string) => {
    onAddToList(selectedContacts, listId);
    setSelectedContactsForList(new Set());
    // Optionally, close any modal if present
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
      openAddContactModal();
    } else {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        openContactDetailsModal(contact);
      }
    }
  };

  const handleGoClick = () => {
    if (selectedContactsForList.size > 0) {
      const listId = prompt("Enter List ID to add selected contacts:");
      if (listId) {
        handleAddToListInternal(Array.from(selectedContactsForList), listId);
      }
    } else {
      alert("Please select at least one contact.");
    }
  };

  // Handler for search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen pb-16 dark:bg-black">
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>
      )}

      {/* Header with "+" button and "Go" button */}
      <div className="flex justify-between items-center mb-4 px-4">
     
       
      </div>

      {/* Contacts Table */}
      <div className="flex-grow overflow-y-auto">
        <ContactsTable
          contacts={contacts}
          userId={userId}
          onContactClick={openContactDetailsModal}
          onCallClick={openCallModal}
          onAddToList={handleAddToListInternal} // Correct signature
          onSelectContact={handleSelectContact}
          selectedContacts={selectedContactsForList}
          onToggleSelectContact={handleToggleSelectContact}
          onSelectAll={handleSelectAll}
          searchQuery={searchQuery} // Pass searchQuery
          onSearchChange={handleSearchChange} // Pass onSearchChange
        />
      </div>

      {/* AddContactModal */}
      <AddContactModal
        isOpen={addContactModalIsOpen}
        onClose={closeAddContactModal}
        onContactAdded={handleAddContact}
        userId={userId}
      />

      {/* ContactDetailsModal */}
      <ContactDetailsModal
        isOpen={detailsModalIsOpen}
        onClose={closeContactDetailsModal}
        contact={selectedContact}
        onContactDeleted={handleDelete}
      />

      {/* CallModal */}
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

      <BottomNav /> {/* Sticky bottom nav bar */}
    </div>
  );
};

export default Contacts;
