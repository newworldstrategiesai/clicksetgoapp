'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'styles/ChatPage.css'; // Assuming you have a CSS file for styling

type Message = {
  sid: string;
  from: string;
  to: string;
  body: string;
  dateSent: string;
};

type Contact = {
  name: string;
  // Add other contact details as needed
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({}); // Replace with your contact info type
  const [twilioNumber, setTwilioNumber] = useState<string>(''); // Set this to your Twilio number
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from Twilio API
  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/get-messages');
      setMessages(response.data);
    } catch (error) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread, messages]);

  const handleSendMessage = async () => {
    if (selectedThread) {
      try {
        await axios.post('/api/send-sms', { body: newMessage, to: selectedThread });
        setNewMessage('');
        fetchMessages(); // Refresh messages after sending a new one
      } catch (error) {
        setError('Failed to send message');
      }
    }
  };

  const handleThreadClick = (thread: string) => {
    setSelectedThread(thread);
  };

  const renderThreads = () => {
    const threads = Array.from(new Set(messages.map(message => message.from))); // Group messages by 'from' field
    return threads.map(thread => (
      <li key={thread} onClick={() => handleThreadClick(thread)}>
        {thread}
      </li>
    ));
  };

  const renderMessages = () => {
    return messages
      .filter(message => message.from === selectedThread || message.to === selectedThread)
      .sort((a, b) => new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime())
      .map(message => (
        <li key={message.sid} className="message-item">
          <strong>{message.from}:</strong> {message.body} <br />
          <span>{new Date(message.dateSent).toLocaleString()}</span>
        </li>
      ));
  };

  const renderContactInfo = () => {
    if (selectedThread && contacts[selectedThread]) {
      return (
        <div className="contact-info">
          {/* Render contact information here */}
          <p><strong>Contact Name:</strong> {contacts[selectedThread].name}</p>
          <p><strong>Phone Number:</strong> {selectedThread}</p>
          {/* Add more contact details as needed */}
        </div>
      );
    }
    return <p>Select a thread to see contact info</p>;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chat-page">
      <div className="navbar">
        <h2>Conversations</h2>
        <ul>
          {renderThreads()}
        </ul>
      </div>
      <div className="chat-window">
        <div className="messages">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul className="messages-list">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </ul>
          )}
        </div>
        <div className="message-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
      <div className="contact-panel">
        <h2>Contact Info</h2>
        {renderContactInfo()}
      </div>
    </div>
  );
};

export default ChatPage;
