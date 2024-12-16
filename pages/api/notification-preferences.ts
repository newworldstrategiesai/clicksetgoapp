import { supabase } from '@/utils/supabaseClient';
import { supabaseServer } from '@/utils/supabaseServerClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { smsEnabled, emailEnabled, email, userId } = req.body;

  // Log to debug
  console.log('Received request:', { smsEnabled, emailEnabled, email, userId });

  // Validation
  if (emailEnabled && !email) {
    return res
      .status(400)
      .json({ error: 'Email address is required when email notifications are enabled.' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        sms_outbound_calls: smsEnabled,
        sms_inbound_calls: smsEnabled,
        email_inbound_calls: emailEnabled,
        email_outbound_call_completion: emailEnabled,
        campaign_email_summary: emailEnabled,
        campaign_sms_initiation: emailEnabled,
        email: email || '',
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ message: 'Preferences saved successfully', data });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Failed to save preferences. Please try again.' });
  }
}