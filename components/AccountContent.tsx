// components/AccountContent.tsx

'use client';

import { useEffect, useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import NotificationsForm from '@/components/ui/AccountForms/NotificationsForm'; // Import NotificationsForm
import CompanySettings from '@/components/ui/AccountForms/CompanySettings'; // Import CompanySettings
import { supabase } from '@/utils/supabaseClient'; // Ensure correct path

const countryCodes: Record<string, { code: string; name: string }> = {
  US: { code: '+1', name: 'United States' },
  IN: { code: '+91', name: 'India' },
  FR: { code: '+33', name: 'France' },
  DE: { code: '+49', name: 'Germany' },
  ES: { code: '+34', name: 'Spain' },
  IT: { code: '+39', name: 'Italy' },
  // ... other countries
};

type AccountContentProps = {
  user: any;
  userDetails: any;
  subscription: any;
  apiKeys: any;
};

export default function AccountContent({
  user,
  userDetails,
  subscription,
  apiKeys,
}: AccountContentProps) {

  if (!user || !user.id) {
    return <div className="text-red-500">User information is missing. Please log in again.</div>;
  }

  const { defaultCountry, setDefaultCountry } = useCountry();
  const [storedCountry, setStoredCountry] = useState(defaultCountry.name);

  useEffect(() => {
    const fetchUserCountry = async () => {
      const { data, error } = await supabase
        .from('client_settings')
        .select('default_country_name')
        .eq('user_id', user.id)
        .single();
      if (error && error.code === 'PGRST116') {
        // No row exists, so we insert a new one
        const defaultCountryName = defaultCountry.name;
        const defaultCountryCode = countryCodes[defaultCountryName].code;
        const { error: insertError } = await supabase
          .from('client_settings')
          .insert({
            user_id: user.id,
            default_country_name: defaultCountryName,
            default_country_code: defaultCountryCode,
          });

        if (insertError) {
          console.error('Error inserting country in Supabase:', insertError.message);
        } else {
          setStoredCountry(defaultCountryName);
          setDefaultCountry({ name: defaultCountryName, code: defaultCountryCode });
        }
      } else if (!error && data) {
        const countryName = data.default_country_name || defaultCountry.name;
        setStoredCountry(countryName);
        setDefaultCountry({ name: countryName, code: countryCodes[countryName].code });
      }
    };

    fetchUserCountry();
  }, [user.id, setDefaultCountry, defaultCountry.name]);

  const handleAccountCountryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = event.target.value;
    const countryCode = countryCodes[selectedCountry];
    setDefaultCountry({ name: selectedCountry, code: countryCode.code });
    setStoredCountry(selectedCountry);

    const { error } = await supabase
      .from('client_settings')
      .update({ default_country_name: selectedCountry, default_country_code: countryCode.code })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating country in Supabase:', error.message);
      window.alert('Error updating country. Please try again.');
    }
  };
  if(!defaultCountry.name){
    setDefaultCountry({ name: 'US', code: '+1' })
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <select
          value={defaultCountry.name || countryCodes['US'].name}
          onChange={handleAccountCountryChange}
          className="dark:bg-gray-800 dark:text-white bg-white text-black p-2 rounded shadow cursor-pointer"
        >
          {Object.entries(countryCodes).map(([code, { name }]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <CustomerPortalForm subscription={subscription} />
      <NameForm userName={userDetails?.full_name ?? ''} userId={user.id} />
      <EmailForm userEmail={user.email} />
      <ApiKeysForm userId={user.id} apiKeys={apiKeys} />

      {/* Add the NotificationsForm */}
      <NotificationsForm userId={user.id} />

      {/* Add the CompanySettings */}
      <CompanySettings userId={user.id} />
    </div>
  );
}
