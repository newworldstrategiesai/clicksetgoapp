// app/account/page.tsx
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import NotificationsForm from '@/components/ui/AccountForms/NotificationsForm'; // Import the NotificationsForm
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import {
  getUserDetails,
  getSubscription,
  getUser,
  getApiKeys,  // Import the function to fetch API keys
} from '@/utils/supabase/queries';

export default async function Account() {
  try {
    const supabase = createClient();
    console.log('Supabase client initialized');

    const user = await getUser(supabase);
    console.log('Fetched user:', user);

    if (!user) {
      console.log('No user found, redirecting to /signin');
      return redirect('/signin');
    }

    // Fetch user details, subscription, and API keys after confirming the user is logged in
    const [userDetails, subscription, apiKeys] = await Promise.all([
      getUserDetails(supabase),
      getSubscription(supabase),
      getApiKeys(supabase, user.id) // Fetch API keys
    ]);

    console.log('Fetched userDetails:', userDetails);
    console.log('Fetched subscription:', subscription);
    console.log('Fetched apiKeys:', apiKeys);

    return (
      <section className="mb-32 bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8 mt-16 md:mt-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Account
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
              We partnered with Stripe for simplified billing.
            </p>
          </div>
        </div>
        <div className="p-4 space-y-8">
          <CustomerPortalForm subscription={subscription} />
          <NameForm userName={userDetails?.full_name ?? ''} userId={user.id} />
          <EmailForm userEmail={user.email} />
          <ApiKeysForm userId={user.id} apiKeys={apiKeys} />
          <NotificationsForm userId={user.id} /> {/* Integrate NotificationsForm */}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
