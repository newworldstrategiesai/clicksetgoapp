'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';

// Updated the role types to 'user' | 'assistant'
interface Message {
  role: 'user' | 'assistant'; 
  message: string;
}

export default function CallTranscriptPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const callId = params?.id;

  useEffect(() => {
    if (callId) {
      // Fetch messages from the getMessages API
      fetch(`/api/getMessages?callId=${callId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
          } else {
            console.error('No messages found for the given callId');
          }
        })
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [callId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage: Message = {
        role: 'assistant',  // New message will be from the assistant
        message: inputMessage.trim(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Call Transcript - ID: {callId || 'Loading...'}
      </h1>
      <div className="bg-white shadow-md rounded-lg p-4 mb-4 h-[50vh] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'assistant'
                ? 'text-blue-600'  // Color for assistant
                : 'text-green-600' // Color for user
            }`}
          >
            <span className="font-semibold">
              {message.role.charAt(0).toUpperCase() + message.role.slice(1)}:
            </span>{' '}
            {message.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your intervention message..."
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
