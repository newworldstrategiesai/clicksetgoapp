import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { smsEnabled, emailEnabled, email,userId } = req.body;
  console.log(smsEnabled, emailEnabled, email, userId)
  // Basic validation
  if (emailEnabled && !email) {
    return res.status(400).json({ error: 'Email address is required when email notifications are enabled.' });
  }

  try {
    // Insert or update preferences in Supabase
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId, // Assume user ID is passed in the request headers
          sms_enabled: smsEnabled,
          email_enabled: emailEnabled,
          email,
        },
      );

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: 'Preferences saved successfully', data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving preferences:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    return res.status(500).json({ error: 'Failed to save preferences. Please try again.' });
  }
}
