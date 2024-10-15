'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useUser } from '@/context/UserContext';

interface Contact {
  first_name: string;
  last_name: string;
  phone: string;
  email_address: string;
  user_id?: string;
}

const UploadContacts = () => {
  const { userId, loading } = useUser();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('User ID from context:', userId);
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    if (!userId) {
      setError('User ID is missing. Please try again later.');
      return;
    }

    Papa.parse<Contact>(file, {
      header: true,
      complete: (results) => {
        console.log('Parsed Results:', results.data);
        const parsedContacts = results.data.map(contact => ({
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          phone: contact.phone ? (contact.phone.startsWith('+1') ? contact.phone : `+1${contact.phone.replace(/[^0-9]/g, '')}`) : '',
          email_address: contact.email_address || '',
          user_id: userId // Add user_id to each contact
        }));
        setContacts(parsedContacts);
        console.log('Parsed contacts with user ID:', parsedContacts);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file.');
      }
    });
  };

  const handleFileUpload = async () => {
    if (!csvFile) return;
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/upload-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      setSuccess(true);
      setContacts([]); // Clear the contacts after successful upload
    } catch (error) {
      console.error('Error uploading contacts:', error);
      setError('Error uploading contacts.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold">Upload Contacts</h1>
        </div>
        <div className="text-center mb-8">
          <p>Upload a CSV file with contacts to make your agents happy.</p>
        </div>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
        {contacts.length > 0 && (
          <>
            <button onClick={handleFileUpload} className="px-6 py-3 bg-blue-600 text-white rounded-lg mb-8">
              {uploading ? <ClipLoader color={"#ffffff"} loading={uploading} size={20} /> : 'Upload'}
            </button>
            {success && <p className="text-green-500">Upload successful!</p>}
            {error && <p className="text-red-500">{error}</p>}
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">First Name</th>
                  <th className="px-4 py-2">Last Name</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{contact.first_name}</td>
                    <td className="px-4 py-2">{contact.last_name}</td>
                    <td className="px-4 py-2">{contact.phone}</td>
                    <td className="px-4 py-2">{contact.email_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {!contacts.length && (
          <button disabled className="px-6 py-3 bg-gray-600 text-white rounded-lg mb-8">
            Import Contacts
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadContacts;
