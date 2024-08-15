// components/TwilioNumberSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

type TwilioNumber = {
  sid: string;
  phoneNumber: string;
};

const TwilioNumberSelector: React.FC = () => {
  const [allNumbers, setAllNumbers] = useState<TwilioNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');

  useEffect(() => {
    const fetchTwilioNumbers = async () => {
      try {
        const response = await axios.get('/api/get-twilio-numbers');
        console.log('Twilio Numbers Response:', response.data);

        const combinedNumbers: TwilioNumber[] = response.data.allNumbers || [];
        console.log('Combined Numbers:', combinedNumbers);

        setAllNumbers(combinedNumbers);

        if (combinedNumbers.length > 0) {
          setSelectedNumber(combinedNumbers[0].phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
      }
    };

    fetchTwilioNumbers();
  }, []);

  return (
    <select
      className="p-2 border rounded-lg w-full bg-gray-800 text-white"
      value={selectedNumber}
      onChange={(e) => setSelectedNumber(e.target.value)}
    >
      {allNumbers.length === 0 ? (
        <option value="">No Twilio numbers available</option>
      ) : (
        allNumbers.map((number) => (
          <option key={number.sid} value={number.phoneNumber}>
            {number.phoneNumber}
          </option>
        ))
      )}
    </select>
  );
};

export default TwilioNumberSelector;
