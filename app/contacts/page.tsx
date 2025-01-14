// app/contacts/page.tsx
// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

import React from 'react';
import ContactsWrapper from '@/components/ui/Contacts/ContactsWrapper'; // Adjust the import path if necessary
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { supabase } from '@/utils/supabaseClient';

export default async function ContactsPage() {
    try {
        const supabase = await createClient();
        const user = await getUser(supabase);

        if (!user) {
            return redirect('/signin');
        }

       const { data, error } = await supabase
      .from('api_keys' as any) // Cast as 'any' to bypass type checking
      .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch API keys');
    //   return redirect('/signin'); // Handle this case as appropriate
    }

    const apiKey = data?.eleven_labs_key;
    const twilioSid = data?.twilio_sid;
    const twilioAuthToken = data?.twilio_auth_token;
    const vapiKey = data?.vapi_key;

    const AllApiKeys = {apiKey, twilioSid, twilioAuthToken, vapiKey};

        return (
            <section className="mb-32 dark:bg-black min-h-screen">
                <div>
                    <ContactsWrapper userId={user.id} AllApiKeys={AllApiKeys}/> {/* Render the Client Component Wrapper */}
                    <ToastContainer /> {/* Render the Toast Container for notifications */}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
