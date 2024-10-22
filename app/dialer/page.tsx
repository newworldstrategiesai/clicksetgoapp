import React from 'react';
import DialerComponent from '@/components/DialerComponent';
import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';

export default async function DialerPage() {
    try {
        const supabase = createClient();
        const user = await getUser(supabase);

        if (!user) {
            return redirect('/signin');
        }

        // Fetch the API key for Eleven Labs from Supabase
        const { data, error } = await supabase
            .from('api_keys' as any)  // Cast as 'any' to bypass type checking
            .select('eleven_labs_key')
            .eq('user_id', user.id)
            .single();

        if (error || !data?.eleven_labs_key) {
            console.error('Failed to fetch Eleven Labs API key');
            return redirect('/signin');  // Handle this case as appropriate
        }

        const apiKey = data.eleven_labs_key;

        return (
            <section className="min-h-screen bg-black text-white">
                <div className="pt-[60px] p-4 bg-black"> {/* Ensure this div has bg-black */}
                    <DialerComponent userId={user.id} apiKey={apiKey} />
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}
