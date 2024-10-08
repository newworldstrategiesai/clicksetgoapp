//app/campaigns/page.tsx
//app/campaigns/page.tsx
import React from 'react';
import CampaignTable from '@/components/ui/CampaignTable'; // Import the new CampaignTable component
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';

export default async function CampaignsPage() {
    try {
        const supabase = createClient();
        const user = await getUser(supabase); // Get the logged-in user

        console.log('User fetched:', user); // Debugging statement

        if (!user) {
            return redirect('/signin'); // Redirect to signin if no user
        }

        return (
            <section className="mb-32 bg-black min-h-screen">
                <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
                    <div className="sm:align-center sm:flex sm:flex-col">
                        <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
                            Campaigns
                        </h1>
                    </div>
                </div>
                <div className="p-4">
                    <CampaignTable userId={user.id} /> {/* Pass userId to CampaignTable */}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
