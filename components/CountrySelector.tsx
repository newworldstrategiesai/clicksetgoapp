import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Import your Supabase client

// Define the country codes and their corresponding prefixes
const countryCodes: Record<string, string> = {
  US: '+1',
  IN: '+91',
  FR: '+33',
  UK: '+44',
  DE: '+49',
  ES: '+34',
  IT: '+39',
  // Add more country codes here
};

const CountrySelector = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultCountry, setDefaultCountry] = useState('');

// Fetching the defualt country from the Supabase
  // useEffect(() => {
  //   const fetchDefaultCountry = async () => {
  //     // Fetch the default country from Supabase
  //     const { data, error } = await supabase
  //       .from('user_country_settings')
  //       .select('default_country_name')
  //       .eq('user_id', user.id)
  //       .single();

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       setDefaultCountry(data.default_country_name);
  //       setSelectedCountry(data.default_country_name);
  //     }
  //   };

  //   fetchDefaultCountry();
  // }, []);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(prevPhoneNumber => prevPhoneNumber + event.target.value.slice(-1));
  };
  

  const prefix = countryCodes[selectedCountry];

  return (
    <div>
      <select value={selectedCountry} onChange={handleCountryChange}>
        {Object.keys(countryCodes).map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={prefix + phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="Enter phone number"
      />
    </div>
  );
};

export default CountrySelector;