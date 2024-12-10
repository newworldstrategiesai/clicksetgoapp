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
import { supabase } from '@/utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify'; // Corrected import
import 'react-toastify/dist/ReactToastify.css'; // Ensure styles are imported

type AccountContentProps = {
  user: any;
  userDetails: any;
  subscription: any;
  apiKeys: any;
};

const countryCodes: Record<string, { code: string; name: string }> = {
  US: { code: '+1', name: 'United States' },
  IN: { code: '+91', name: 'India' },
  // ... other countries
};

export default function AccountContent({
  user,
  userDetails,
  subscription,
  apiKeys,
}: AccountContentProps) {
  console.log('AccountContent user:', user);
  console.log('user.id:', user.id);

  if (!user || !user.id) {
    return (
      <div className="text-red-500">
        User information is missing. Please log in again.
      </div>
    );
  }

  const { defaultCountry, setDefaultCountry } = useCountry();
  const [storedCountry, setStoredCountry] = useState(defaultCountry.name);

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const { data, error } = await supabase
          .from('client_settings')
          .select('default_country_name')
          .eq('user_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No row exists, so we insert a new one
          const defaultCountryName = defaultCountry.name;

          if (!countryCodes[defaultCountryName]) {
            console.error(
              `Country code for "${defaultCountryName}" not found in countryCodes`
            );
            toast.error(
              `Default country "${defaultCountryName}" is not supported. Please update your country settings.`
            );
            return;
          }

          const defaultCountryCode = countryCodes[defaultCountryName].code;
          const { error: insertError } = await supabase
            .from('client_settings')
            .insert({
              user_id: user.id,
              default_country_name: defaultCountryName,
              default_country_code: defaultCountryCode,
            });

          if (insertError) {
            console.error(
              'Error inserting country in Supabase:',
              insertError.message
            );
            toast.error('Failed to set up default country.');
          } else {
            setStoredCountry(defaultCountryName);
            setDefaultCountry({
              name: defaultCountryName,
              code: defaultCountryCode,
            });
          }
        } else if (!error && data) {
          const countryName = data.default_country_name || defaultCountry.name;

          if (!countryCodes[countryName]) {
            console.error(
              `Country code for "${countryName}" not found in countryCodes`
            );
            toast.error(
              `Country "${countryName}" is not supported. Please update your country settings.`
            );
            return;
          }

          setStoredCountry(countryName);
          setDefaultCountry({
            name: countryName,
            code: countryCodes[countryName].code,
          });
        } else if (error) {
          console.error('Error fetching user country:', error.message);
          toast.error('Failed to fetch country settings.');
        }
      } catch (err) {
        console.error('Unexpected error fetching user country:', err);
        toast.error('An unexpected error occurred.');
      }
    };

    fetchUserCountry();
  }, [user.id, setDefaultCountry, defaultCountry.name]);

  const handleAccountCountryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = event.target.value;

    if (!countryCodes[selectedCountry]) {
      toast.error(`Country "${selectedCountry}" is not supported.`);
      return;
    }

    const countryCode = countryCodes[selectedCountry].code;
    setDefaultCountry({ name: selectedCountry, code: countryCode });
    setStoredCountry(selectedCountry);

    const { error } = await supabase
      .from('client_settings')
      .update({
        default_country_name: selectedCountry,
        default_country_code: countryCode,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating country in Supabase:', error.message);
      toast.error('Error updating country. Please try again.');
    } else {
      toast.success('Country updated successfully.');
    }
  };

  return (
    <div className="p-4">
      <ToastContainer /> {/* Added ToastContainer */}

      <div className="text-center mb-6">
        <select
          value={storedCountry || 'US'}
          onChange={handleAccountCountryChange}
          className="bg-gray-800 dark:text-white p-2 rounded shadow"
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
