import React from 'react';
import ListsTable from '@/components/ListsTable'; // Ensure this path is correct
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser, getLists } from '@/utils/supabase/queries';

export default async function ListsPage() {
    const supabase = createClient();

    try {
        const user = await getUser(supabase);

        if (!user) {
            return redirect('/signin');
        }

        // Fetch lists for the current user by passing user.id
        const lists = await getLists(supabase, user.id);

        return (
            <div className="pt-8 p-4">
                <section className="bg-black">
                    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
                        <div className="sm:align-center sm:flex sm:flex-col">
                            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
                                Lists
                            </h1>
                        </div>
                    </div>
                    <div className="p-4">
                        <ListsTable 
                            lists={lists || []} 
                            userId={user.id} // Pass userId to ListsTable
                        />
                    </div>
                </section>
            </div>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
