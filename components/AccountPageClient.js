'use client';

import React, { useEffect } from 'react';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import { useUser } from '@/context/UserContext';

// Define interfaces for the props
interface User {
  id: string;
  email: string;
}

interface UserDetails {
  full_name: string;
}

interface Subscription {
  // Define the properties of subscription here
  // Example:
  planName: string;
  status: string;
}

interface AccountPageClientProps {
  user: User;
  userDetails: UserDetails;
  subscription: Subscription;
}

export default function AccountPageClient({
  user,
  userDetails,
  subscription,
}: AccountPageClientProps) {
  const { setUserId } = useUser();

  useEffect(() => {
    setUserId(user.id);
  }, [user.id, setUserId]);

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
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
        <ApiKeysForm userId={user.id} />
      </div>
    </section>
  );
}
