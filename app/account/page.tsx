import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
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
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Fetch user details, subscription, and API keys after confirming the user is logged in
    const [userDetails, subscription, apiKeys] = await Promise.all([
      getUserDetails(supabase),
      getSubscription(supabase),
      getApiKeys(supabase, user.id) // Fetch API keys
    ]);

    return (
      <section className="mb-32 bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8 mt-16 md:mt-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Account
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
              We partnered with Stripe for a simplified billing.
            </p>
          </div>
        </div>
        <div className="p-4">
          <CustomerPortalForm subscription={subscription} />
          <NameForm userName={userDetails?.full_name ?? ''} userId={user.id} />
          <EmailForm userEmail={user.email} />
          <ApiKeysForm userId={user.id} apiKeys={apiKeys} /> {/* Pass API keys to the form */}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
