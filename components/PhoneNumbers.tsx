// components/PhoneNumbers.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';

interface PhoneNumber {
  sid: string;
  phoneNumber: string;
}

interface PhoneNumbersProps {
  userId: string;
  twilioSid: string;
  twilioAuthToken: string;
}

const PhoneNumbers: React.FC<PhoneNumbersProps> = ({ userId, twilioSid, twilioAuthToken }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const response = await fetch('/api/phone-numbers/get', { // Ensure this endpoint exists
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_Id: userId,
            twilioClient: {
              twilioSid,
              twilioAuthToken,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch phone numbers');
        }

        const data = await response.json();
        setPhoneNumbers(data.allNumbers);
      } catch (error: any) {
        console.error('Error fetching phone numbers:', error);
        toast.error(`Error fetching phone numbers: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, [userId, twilioSid, twilioAuthToken]);

  const handleDelete = async (sid: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this phone number?');
    if (!confirmDelete) return;

    setIsDeleting((prev) => ({ ...prev, [sid]: true }));

    try {
      const response = await fetch('/api/phone-numbers/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sid, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete phone number');
      }

      // Remove the deleted number from the list
      setPhoneNumbers((prev) => prev.filter((number) => number.sid !== sid));
      toast.success('Phone number deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting phone number:', error);
      toast.error(`Error deleting phone number: ${error.message}`);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [sid]: false }));
    }
  };

  return (
    <Card
      title="Connected Phone Numbers"
      description="Manage your connected Twilio phone numbers."
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
      {isLoading ? (
        <p className="text-center text-gray-600">Loading phone numbers...</p>
      ) : phoneNumbers.length === 0 ? (
        <p className="text-center text-gray-600">No connected phone numbers found.</p>
      ) : (
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Phone Number</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {phoneNumbers.map((number) => (
              <tr key={number.sid} className="text-center">
                <td className="border px-4 py-2">{number.phoneNumber}</td>
                <td className="border px-4 py-2">
                  <Button
                    onClick={() => handleDelete(number.sid)}
                    disabled={isDeleting[number.sid]}
                    className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${
                      isDeleting[number.sid] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isDeleting[number.sid] ? 'Deleting...' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default PhoneNumbers;
