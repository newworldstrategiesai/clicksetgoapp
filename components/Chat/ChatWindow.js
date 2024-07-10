"use client"; // Add this line at the top

import React, { useState, useEffect } from 'react';

const ChatWindow = ({ user, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chat with {user.name}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender === 'user' ? 'user-message' : 'customer-message'}`}>
            <span>{message.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .chat-header {
          background: #f5f5f5;
          padding: 16px;
          border-bottom: 1px solid #ccc;
        }
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        .chat-message {
          margin-bottom: 8px;
        }
        .user-message {
          text-align: right;
        }
        .customer-message {
          text-align: left;
        }
        .chat-input {
          display: flex;
          padding: 16px;
          border-top: 1px solid #ccc;
        }
        .chat-input input {
          flex: 1;
          padding: 8px;
          margin-right: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .chat-input button {
          padding: 8px 16px;
          border: none;
          background: #007bff;
          color: #fff;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
