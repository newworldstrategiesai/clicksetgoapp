// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

// pages/new-campaign.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/server'; // make sure this imports Supabase correctly
import { getUser } from '@/utils/supabase/queries'; // ensure this is the correct path to getUser function
import { NewCampaign } from '@/components/new-campaign'; // ensure this path is correct

export default async function NewCampaignPage() {
  try {
    const supabase = await createClient();
    
    // Fetch the logged-in user
    const user = await getUser(supabase);

    // Fetch API keys
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('twilio_sid, twilio_auth_token')
      .eq('user_id', user?.id)
      .single();

    if (apiKeyError) {
      console.error('Error fetching API keys:', apiKeyError);
    }
    const twilioSid = apiKeyData?.twilio_sid || '';
    const twilioAuthToken = apiKeyData?.twilio_auth_token || '';
    // If no user is found, redirect to sign-in
    if (!user) {
      console.error('No user found. Redirecting to sign in.');
      return redirect('/signin');
    }

    console.log('User found:', user); // Debugging user retrieval

    // Render the NewCampaign component with the userId passed as a prop
    return (
      <div className="pt-16">
        {' '}
        {/* Add padding to prevent navbar overlap */}
        <NewCampaign userId={user.id} twilioSid={twilioSid} twilioAuthToken={twilioAuthToken} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
