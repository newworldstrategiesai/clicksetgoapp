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

        return (
            <section className="min-h-screen bg-gray-900 text-white">
                <div className="pt-[60px] p-4"> {/* Adjust the padding-top to match the height of your navbar */}
                    <DialerComponent />
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching user data:', error);
        return redirect('/signin');
    }
}