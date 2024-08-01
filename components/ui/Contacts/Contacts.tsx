"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "utils/supabaseClient";
import AddContactModal from "components/AddContactModal";
import ContactDetailsModal from "components/ContactDetailsModal";
import CallModal from "components/CallModal";
import Modal from "react-modal";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_address?: string;
  linkedin?: string;
  position?: string;
  company?: string;
  company_phone?: string;
  website?: string;
  domain?: string;
  facebook?: string;
  twitter?: string;
  linkedin_company_page?: string;
  country?: string;
  state?: string;
  vertical?: string;
  sub_category?: string;
  notes?: string;
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

interface FetchContactsResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface FetchListsResponse {
  id: string;
  name: string;
  contactsCount: number;
}

interface FetchTwilioNumbersResponse {
  sid: string;
  phoneNumber: string;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "black",
    color: "white",
  },
};

const Contacts = ({ userId }: { userId: string }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [twilioNumbers, setTwilioNumbers] = useState<TwilioNumber[]>([]);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [callModalIsOpen, setCallModalIsOpen] = useState(false);
  const [newListModalIsOpen, setNewListModalIsOpen] = useState(false);
  const [newContactModalIsOpen, setNewContactModalIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<string>("");
  const [callReason, setCallReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const [newListName, setNewListName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contacts
        const responseContacts = await fetch(`/api/contacts?userId=${userId}`);
        const contactsData: FetchContactsResponse[] = await responseContacts.json();
        const parsedContacts = contactsData.map((contact) => ({
          ...contact,
          phone: contact.phone.startsWith("+") ? contact.phone : `+${contact.phone.replace(/[^0-9]/g, "")}`,
        }));
        setContacts(parsedContacts);

        // Fetch lists
        const responseLists = await fetch(`/api/lists?userId=${userId}`);
        const listsData: FetchListsResponse[] = await responseLists.json();
        setLists(listsData);

        // Fetch Twilio numbers
        const responseTwilioNumbers = await fetch("/api/get-twilio-numbers");
        const twilioNumbersData: FetchTwilioNumbersResponse[] = await responseTwilioNumbers.json();
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
    setCallReason("");
    setSelectedTwilioNumber("");
    setError("");
  };

  const openNewListModal = () => {
    setNewListModalIsOpen(true);
  };

  const closeNewListModal = () => {
    setNewListModalIsOpen(false);
    setNewListName("");
    setSelectedContacts(new Set());
    setError("");
  };

  const openNewContactModal = () => {
    setNewContactModalIsOpen(true);
  };

  const closeNewContactModal = () => {
    setNewContactModalIsOpen(false);
    setError("");
  };

  const handleCallNow = async () => {
    if (!selectedContact || !callReason || !selectedTwilioNumber) {
      setError("Please provide all required information.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/make-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: selectedContact,
          reason: callReason,
          twilioNumber: selectedTwilioNumber,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Call initiated:", data);
        alert("Call initiated successfully!");
      } else {
        console.error("Failed to initiate call:", data);
        setError("Failed to initiate call.");
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      setError("Failed to initiate call.");
    } finally {
      setLoading(false);
      closeCallModal();
    }
  };

  const handleSaveList = async () => {
    if (!newListName || selectedContacts.size === 0) {
      setError("Please provide a list name and select at least one contact.");
      return;
    }

    const selectedContactArray = Array.from(selectedContacts);

    try {
      setLoading(true);
      const response = await fetch("/api/create-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newListName,
          contacts: selectedContactArray,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("List created:", data);
        setLists((prevLists) => [...prevLists, { id: data.id, name: newListName, contactsCount: selectedContactArray.length }]);
        closeNewListModal();
      } else {
        console.error("Failed to create list:", data);
        setError("Failed to create list.");
      }
    } catch (error) {
      console.error("Error creating list:", error);
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

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.user_id === userId &&
      ((contact.first_name && contact.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.last_name && contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        contact.phone.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mb-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <button
            className={`px-4 py-2 ${activeTab === "contacts" ? "bg-white text-black" : "bg-gray-700 text-gray-400"}`}
            onClick={() => setActiveTab("contacts")}
          >
            Contacts
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "lists" ? "bg-white text-black" : "bg-gray-700 text-gray-400"}`}
            onClick={() => setActiveTab("lists")}
          >
            Lists
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-2 mt-2 md:mt-0">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={openNewContactModal}
          >
            Upload Contacts
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={openNewContactModal}
          >
            Add Contact
          </button>
          <input
            type="text"
            placeholder={activeTab === "contacts" ? "Search Contacts" : "Search Lists"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2 md:mt-0 p-2 border rounded-lg text-black"
          />
        </div>
      </div>
      {activeTab === "contacts" && (
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 md:px-6 py-2">Name</th>
                  <th className="px-4 md:px-6 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr key={index} className="border-t cursor-pointer hover:bg-gray-700">
                    <td
                      className="px-4 md:px-6 py-2"
                      onClick={() => openContactDetailsModal(contact)}
                    >
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td
                      className="px-4 md:px-6 py-2"
                      onClick={() => openCallModal(contact)}
                    >
                      {contact.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "lists" && (
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 md:px-6 py-2">List Name</th>
                  <th className="px-4 md:px-6 py-2">Contacts Count</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 md:px-6 py-2">{list.name}</td>
                    <td className="px-4 md:px-6 py-2">{list.contactsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ContactDetailsModal
        isOpen={detailsModalIsOpen}
        onRequestClose={closeContactDetailsModal}
        contact={selectedContact}
        onContactDeleted={handleContactDeleted}
      />
      <CallModal
        isOpen={callModalIsOpen}
        onRequestClose={closeCallModal}
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
      <Modal
        isOpen={newListModalIsOpen}
        onRequestClose={closeNewListModal}
        style={customStyles}
        contentLabel="New List Modal"
      >
        <h2 className="text-xl font-bold mb-4">Create New List</h2>
        <label className="block mb-2">
          <span className="block text-gray-400">List Name:</span>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </label>
        <div className="mb-4">
          <p className="text-gray-400">Select Contacts:</p>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <label key={contact.id} className="block">
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.id)}
                  onChange={() => handleSelectContact(contact.id)}
                  className="mr-2"
                />
                {contact.first_name} {contact.last_name}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleSaveList}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save List"}
        </button>
      </Modal>
      <AddContactModal
        isOpen={newContactModalIsOpen}
        onRequestClose={closeNewContactModal}
        userId={userId}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
};

export default Contacts;
