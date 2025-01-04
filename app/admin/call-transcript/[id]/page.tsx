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
  const [callRecordingUrl, setCallRecordingUrl] = useState<string | null>(null); // For storing the recording URL
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const callId = params?.id;

  // Fetch messages and call details (including the recording URL)
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

      // Fetch call recording details from the API (or wherever it's stored)
      fetch(`/api/get-call-data?userId=someUserId&callId=${callId}`) // Assuming the API URL here
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            const callData = data[0]; // Assuming we're only fetching one call at a time
            setCallRecordingUrl(callData.monitor?.listenUrl || null);  // Set the recording URL
          }
        })
        .catch((err) => console.error('Error fetching call details:', err));
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

      {/* Display the audio player if the recording URL exists */}
      {callRecordingUrl && (
        <div className="mb-6">
          <strong className="text-gray-700">Call Recording:</strong>
          <audio controls className="mt-2 w-full">
            <source src={callRecordingUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

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
