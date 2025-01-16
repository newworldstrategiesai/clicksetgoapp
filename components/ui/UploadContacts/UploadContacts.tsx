'use client';

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useUser } from '@/context/UserContext';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import styles

interface Contact {
  first_name: string;
  last_name: string;
  phone: string;
  email_address: string;
  user_id?: string;
}
interface UploadContactsProps {
  user: {
    id: string;
  };
}
const UploadContacts: React.FC<UploadContactsProps> = ({ user }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input
  const dropZoneRef = useRef<HTMLDivElement | null>(null); // Ref for the drop zone
  const { userId, loading } = useUser();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicates, setDuplicates] = useState<Contact[]>([]);
  const [contactCount, setContactCount] = useState<number>(0); // Track contact count
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log('User ID from context:', user.id);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      parseCSV(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse<Contact>(file, {
      header: true,
      complete: (results) => {
        console.log('Parsed Results:', results.data);
        const parsedContacts = results.data
          .filter(contact => contact.first_name || contact.last_name || contact.phone || contact.email_address)
          .map(contact => ({
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            phone: contact.phone ? `${contact.phone.replace(/[^0-9]/g, '')}` : '',
            email_address: contact.email_address || '',
            user_id: user.id || '' // Use empty string if userId is null
          }));
        setContacts(parsedContacts);
        setContactCount(parsedContacts.length);
        console.log('Parsed contacts with user ID:', parsedContacts);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file.'); // Show error toast
      }
    });
  };

  const handleFileUpload = async () => {
    if (!csvFile || !user.id) {
      toast.error('Please select a file and ensure you are logged in.'); // Show error toast
      return;
    }

    setUploading(true);

    const clientID = user.id;
    try {
      const response = await fetch('/api/upload-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts, clientID }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      const duplicatesCount = data.duplicates.length;
      const totalParsed = contacts.length;
      const uploadedCount = totalParsed - duplicatesCount;

      setDuplicates(data.duplicates);

      if (duplicatesCount === totalParsed) {
        toast.info(`No data uploaded. All ${totalParsed} contacts are duplicates.`);
      } else if (duplicatesCount > 0) {
        toast.info(
          `Upload completed. ${uploadedCount} contacts uploaded successfully, and ${duplicatesCount} were duplicates.`
        );
      } else {
        toast.success(`All ${totalParsed} contacts uploaded successfully!`);
      }

      setContacts([]);
      setCsvFile(null);
      setContactCount(0); // Reset contact count
    } catch (error: any) {
      console.error('Error uploading contacts:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDummyCSV = () => {
    const dummyData = [
      ['first_name', 'last_name', 'phone', 'email_address'], // Headers
      ['John', 'Doe', '1234567890', 'john.doe@example.com'],
      ['Jane', 'Smith', '9876543210', 'jane.smith@example.com'],
      ['Alex', '', '5551234567', 'alex@example.com'], // Missing last name
      ['', 'Brown', '', 'brown@example.com'], // Missing first name and phone
    ];

    const csvContent = dummyData.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dummy_contacts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv') {
        setCsvFile(file);
        parseCSV(file);
      } else {
        // setError('Please upload a valid CSV file.');
        toast.error('Please upload a valid CSV file.'); // Show error toast
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black text-gray-800 dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
        <div className='flex justify-between'>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 rounded bg-gray-600 dark:bg-gray-700 text-white ml-4 mb-4"
        >
          ← Back
        </button>
        <button
          onClick={handleDownloadDummyCSV}
          className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white mb-4 font-medium"
        >
         Download Sample CSV
        </button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Upload Contacts</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload a CSV file with contacts to make your agents happy.</p>
        </div>

        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 mb-6 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} transition-colors duration-200`}
        >
          <p className="text-center text-gray-600 dark:text-gray-400">Drag and drop your CSV file here</p>
          <p className="text-center text-gray-400 dark:text-gray-600">or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="block mx-auto mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded"
          >
            Browse Files
          </button>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        {contacts.length > 0 && (
          <div>
            <p className="text-center text-gray-600 dark:text-gray-400">Total Contacts: {contactCount}</p> {/* Display contact count */}
            <button
              onClick={handleFileUpload}
              className="w-full px-6 py-3 rounded bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
            >
              {uploading ? <ClipLoader color={"#ffffff"} loading={uploading} size={20} /> : 'Upload'}
            </button>

            {/* {success && <p className="text-center text-green-500 mt-4">Upload successful!</p>} */}
            {/* {error && <p className="text-center text-red-500 mt-4">{error}</p>} */}

            <div className="overflow-auto mt-6">
              <table className="table-auto w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">First Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Last Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Phone</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{contact.first_name}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{contact.last_name}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{contact.phone}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{contact.email_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!contacts.length && (
          <button
            disabled
            className="w-full px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-medium cursor-not-allowed"
          >
            Import Contacts
          </button>
        )}
      </div>
      

      <ToastContainer /> {/* Add ToastContainer to render toasts */}
    </div>
  );
};

export default UploadContacts;
