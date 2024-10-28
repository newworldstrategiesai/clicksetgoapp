//app/campaigns/page.tsx
//app/campaigns/page.tsx
import React from 'react';
import CampaignTable from '@/components/ui/CampaignTable'; // Import the new CampaignTable component
import { redirect } from 'next/navigation';
import { createClient } from '@/app/server';
import { getUser } from '@/utils/supabase/queries';

export default async function CampaignsPage() {
    try {
        const supabase = createClient();
        const user = await getUser(supabase); // Get the logged-in user

        console.log('User fetched:', user); // Debugging statement

        if (!user) {
            return redirect('/signin'); // Redirect to signin if no user
        }

        const { data, error } = await supabase
            .from('api_keys' as any)  // Cast as 'any' to bypass type checking
            .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            console.error('Failed to fetch Eleven Labs API key');
            return redirect('/signin');  // Handle this case as appropriate
        }

        const apiKey = data.eleven_labs_key;
        const twilioSid = data.twilio_sid;
        const twilioAuthToken = data.twilio_auth_token;
        const vapiKey = data.vapi_key;

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
                    <CampaignTable userId={user.id} apiKey={apiKey} twilioSid = {twilioSid} twilioAuthToken = {twilioAuthToken} vapiKey = {vapiKey} /> {/* Pass userId to CampaignTable */}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
