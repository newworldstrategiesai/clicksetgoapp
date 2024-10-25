// app/contacts/page.tsx

import React from 'react';
import ContactsWrapper from '@/components/ui/Contacts/ContactsWrapper'; // Adjust the import path if necessary
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

export default async function ContactsPage() {
    try {
        const supabaseClient = createClient();
        const user = await getUser(supabaseClient);

        if (!user) {
            return redirect('/signin');
        }

        return (
            <section className="mb-32 bg-black min-h-screen">
                <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
                    <div className="sm:align-center sm:flex sm:flex-col">
                        {/* Optional: Add headers or other content here */}
                    </div>
                </div>
                <div className="p-4">
                    <ContactsWrapper userId={user.id} /> {/* Render the Client Component Wrapper */}
                    <ToastContainer /> {/* Render the Toast Container for notifications */}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
