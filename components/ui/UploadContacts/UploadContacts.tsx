"use client"; // Add this line at the top

import React, { useState } from 'react';
import Papa from 'papaparse';
import { ClipLoader } from 'react-spinners'; // Import a spinner component

interface Contact {
  'First-name': string;
  'Last-name': string;
  'Phone': string;
  'Email': string;
}

const UploadContacts = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!csvFile) return;
    setLoading(true);

    Papa.parse<Contact>(csvFile, {
      header: true,
      complete: (results) => {
        console.log('Parsed Results:', results.data); // Debugging: Log parsed results
        const parsedContacts = results.data.map(contact => ({
          'First-name': contact['First-name'] || '',
          'Last-name': contact['Last-name'] || '',
          'Phone': contact['Phone'] ? (contact['Phone'].startsWith('+') ? contact['Phone'] : `+${contact['Phone'].replace(/[^0-9]/g, '')}`) : '',
          'Email': contact['Email'] || ''
        }));
        console.log('Parsed Contacts:', parsedContacts); // Debugging: Log parsed contacts
        setContacts(parsedContacts);
        setLoading(false);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file.');
        setLoading(false);
      }
    });
  };

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
        <button onClick={handleFileUpload} className="px-6 py-3 bg-blue-600 text-white rounded-lg mb-8">Import Contacts</button>
        {loading && <ClipLoader color={"#ffffff"} loading={loading} size={50} />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && contacts.length > 0 && (
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
                  <td className="px-4 py-2">{contact['First-name']}</td>
                  <td className="px-4 py-2">{contact['Last-name']}</td>
                  <td className="px-4 py-2">{contact['Phone']}</td>
                  <td className="px-4 py-2">{contact['Email']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UploadContacts;
