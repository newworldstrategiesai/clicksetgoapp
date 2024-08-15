import React from 'react';
import Contacts from '@/components/ui/Contacts/Contacts';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';

export default async function ContactsPage() {
    try {
        const supabase = createClient();
        const user = await getUser(supabase);

        if (!user) {
            return redirect('/signin');
        }

        return (
            <section className="mb-32 bg-black">
                <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
                    <div className="sm:align-center sm:flex sm:flex-col">
                        <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
                            Contacts
                        </h1>
                    </div>
                </div>
                <div className="p-4">
                    <Contacts userId={user.id} />
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}