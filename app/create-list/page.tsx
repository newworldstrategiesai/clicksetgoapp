"use client";

import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const CreateListPage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useSupabaseAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setError('You must be logged in to create a list.');
      return;
    }

    try {
      const response = await fetch('/api/create-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setSuccess('List created successfully');
        setName('');
      } else {
        const data = await response.json();
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-4">Create New List</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label htmlFor="name" className="block mb-2 text-sm">List Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 rounded"
          required
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create List
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && <p className="mt-4 text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default CreateListPage;
