'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from 'utils/supabaseClient';

interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
  contactName: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

const SmsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<{ [key: string]: Message[] }>({});
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase.from('contacts').select('*');
        if (error) throw error;
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/get-sms-logs');
        const fetchedMessages = response.data.messages;

        const formattedMessages = fetchedMessages.map((msg: any) => {
          return {
            id: msg.sid,
            from: msg.from,
            to: msg.to,
            body: msg.body,
            dateSent: msg.dateSent,
            contactName: ''
          };
        });

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages from Twilio:', error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const updatedThreads: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const contactPhone = message.from.startsWith('+') ? message.from : message.to;

      if (!updatedThreads[contactPhone]) {
        const contact = contacts.find(
          (contact) =>
            contact.phone === message.from || contact.phone === message.to
        );
        if (contact) {
          updatedThreads[contactPhone] = [];
          message.contactName = `${contact.first_name} ${contact.last_name}`;
        }
      }

      if (updatedThreads[contactPhone]) {
        updatedThreads[contactPhone].push(message);
      }
    });

    Object.values(updatedThreads).forEach((thread) => {
      thread.sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime());
    });

    setThreads(updatedThreads);
  }, [messages, contacts]);

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) {
      setError('Please enter a message.');
      return;
    }

    const contactMessages = threads[selectedContact] || [];
    const lastMessage = contactMessages[contactMessages.length - 1];
    const to = lastMessage ? (lastMessage.from.startsWith('+') ? lastMessage.from : lastMessage.to) : '';

    try {
      const response = await axios.post('/api/send-sms', {
        message: {
          functionCall: {
            parameters: {
              callerName: 'You',
              smsMessage: newMessage.trim(),
              callerNumber: to,
            }
          }
        }
      });
      setMessages([...messages, response.data.messageDetails]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex flex-1">
        <div className="w-1/3 border-r border-gray-600">
          <h2 className="text-xl font-bold p-4 border-b border-gray-600">Contacts</h2>
          <ul className="overflow-y-auto">
            {Object.keys(threads)
              .map((contactPhone) => {
                const contactThread = threads[contactPhone];
                if (!contactThread || contactThread.length === 0) return null;

                const contactName = contactThread[0].contactName;
                return (
                  <li
                    key={contactPhone}
                    className={`p-4 cursor-pointer ${selectedContact === contactPhone ? 'bg-blue-900' : ''}`}
                    onClick={() => setSelectedContact(contactPhone)}
                  >
                    <div className="font-bold">{contactName}</div>
                    <div className="text-sm text-gray-400">{contactPhone}</div>
                  </li>
                );
              })
              .filter((item): item is JSX.Element => item !== null) // Filter out null values
              .sort((a, b) => {
                const aKey = a.props.key;
                const bKey = b.props.key;

                const threadA = threads[aKey];
                const threadB = threads[bKey];

                if (!threadA || threadA.length === 0 || !threadB || threadB.length === 0) {
                  return 0; // If either thread is empty, do not sort them
                }

                const dateA = new Date(threadA[0].dateSent);
                const dateB = new Date(threadB[0].dateSent);

                return dateB.getTime() - dateA.getTime();
              })}
          </ul>
        </div>
        <div className="w-2/3 flex flex-col">
          {selectedContact ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {threads[selectedContact]?.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="text-sm text-gray-400">{new Date(message.dateSent).toLocaleString()}</div>
                    <div className="p-2 rounded-lg bg-blue-900">{message.body}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-600">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-2 border rounded-lg bg-gray-800 text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Send
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a contact to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsPage;
