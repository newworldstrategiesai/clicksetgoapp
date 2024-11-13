// components/AccountContent.tsx

'use client';

import { useEffect, useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import NotificationsForm from '@/components/ui/AccountForms/NotificationsForm'; // Import NotificationsForm
import { supabase } from '@/utils/supabaseClient';

const countryCodes: Record<string, { code: string; name: string }> = {
  US: { code: '+1', name: 'United States' },
  IN: { code: '+91', name: 'India' },
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
      } else if (!error) {
        const countryName = data?.default_country_name || defaultCountry.name;
        setStoredCountry(countryName);
        setDefaultCountry({ name: countryName, code: countryCodes[countryName].code });
      }
    };

    fetchUserCountry();
  }, [user.id, setDefaultCountry, defaultCountry.name]);

  const handleAccountCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
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

  return (
    <div className="p-4">
      <div style={{ textAlign: 'center' }}>
        <select
          value={defaultCountry.name || 'US'}
          onChange={handleAccountCountryChange}
          style={{ boxShadow: '0 0 5px 5px #2E1065' }}
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
    </div>
  );
}
