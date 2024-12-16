// pages/account/page.tsx

export const dynamic = 'force-dynamic';

import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import NotificationsForm from '@/components/ui/AccountForms/NotificationsForm';
import PhoneNumbers from '@/components/PhoneNumbers';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/server.server';
import {
  getUserDetails,
  getSubscription,
  getUser,
  getApiKeys,
} from '@/utils/supabase/queries';
import AccountContent from '@/components/AccountContent';

export default async function Account() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);
    // console.log('Fetched user:', user);

    if (!user) {
      console.log('No user found, redirecting to /signin');
      return redirect('/signin');
    }

    const userDetails = await getUserDetails(supabase);
    const subscription = await getSubscription(supabase);
    const apiKeys = await getApiKeys(supabase, user.id);

    // console.log('Fetched userDetails:', userDetails);
    // console.log('Fetched subscription:', subscription);
    // console.log('Fetched apiKeys:', apiKeys);

    // Extract Twilio credentials from apiKeys
    const twilioSid = apiKeys?.twilio_sid || '';
    const twilioAuthToken = apiKeys?.twilio_auth_token || '';

    return (
      <section className="mb-32 dark:bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8 mt-16 md:mt-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold dark:text-white sm:text-center sm:text-6xl">
              Account
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-gray-500 dark:text-zinc-200 sm:text-center sm:text-2xl">
              We partnered with Stripe for simplified billing.
            </p>
          </div>
        </div>
        <div className="p-4">
          <AccountContent
            user={user}
            userDetails={userDetails}
            subscription={subscription}
            apiKeys={apiKeys}
          />
          {/* Add the PhoneNumbers component below AccountContent */}
          {twilioSid && twilioAuthToken ? (
            <PhoneNumbers
              userId={user.id}
              twilioSid={twilioSid}
              twilioAuthToken={twilioAuthToken}
            />
          ) : (
            <p className="text-center text-gray-400 mt-4">
              Twilio credentials are not set. Please add your Twilio API keys.
            </p>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
