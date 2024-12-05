'use client';

import React, { useState, useEffect } from 'react';
import ListsTable from 'components/ListsTable'; // Updated path
import AddContactModal from '@/components/AddContactModal'; // Updated path
import { supabase } from '@/utils/supabaseClient';
import Modal from 'react-modal';

interface List {
  id: string;
  name: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email_address?: string;
  phone?: string;
}

// Custom styles for the modal
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'black',
    color: 'white',
  },
};

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };

    fetchCurrentUser();
  }, []);

  // Fetch lists for the current user
  useEffect(() => {
    if (userId) {
      const fetchLists = async () => {
        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching lists:', error);
        } else {
          setLists(data);
        }
        setLoading(false);
      };

      fetchLists();
    }
  }, [userId]);

  // Fetch users in the selected list
  useEffect(() => {
    if (selectedListId) {
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from('contact_lists')
          .select('contacts(id, first_name, last_name, email_address, phone)')
          .eq('list_id', selectedListId)
          .single();

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setUsers(data ? data.contacts : []);
        }
      };

      fetchUsers();
    }
  }, [selectedListId]);

  // Handle creation of a new list
  const handleCreateList = async () => {
    if (!newListName.trim() || !userId) return;

    const { data, error } = await supabase
      .from('lists')
      .insert([{ name: newListName, user_id: userId }])
      .single();

    if (error) {
      console.error('Error creating list:', error);
    } else {
      setLists((prevLists) => [...prevLists, data]);
      setNewListName('');
      setIsModalOpen(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Lists</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 dark:text-white px-4 py-2 rounded-lg mb-4 block mx-auto"
      >
        Create List
      </button>

      {/* Create List Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customModalStyles}
        contentLabel="Create List Modal"
      >
        <h2 className="text-xl font-bold mb-4">Create New List</h2>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="List Name"
          className="p-2 border rounded-lg w-full mb-4"
        />
        <button
          onClick={handleCreateList}
          className="px-4 py-2 bg-blue-600 dark:text-white rounded-lg"
        >
          Create List
        </button>
      </Modal>

      <div className="mb-4">
        {lists.length > 0 ? (
          <ul className="list-disc pl-5">
            {lists.map((list) => (
              <li key={list.id} className="mb-2">
                <button
                  onClick={() => setSelectedListId(list.id)}
                  className="text-blue-500 underline hover:text-blue-700"
                >
                  {list.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No lists available.</p>
        )}
      </div>

      {selectedListId && (
        <div>
          <h2 className="text-xl font-bold mb-4">Users in Selected List</h2>
          {users.length > 0 ? (
            <ul className="list-disc pl-5">
              {users.map((user) => (
                <li key={user.id} className="mb-2">
                  {user.first_name} {user.last_name} - {user.email_address || user.phone}
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found in this list.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListsPage;
