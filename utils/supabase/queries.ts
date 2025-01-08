// app/utils/supabase/queries.ts

import { SupabaseClient } from '@supabase/supabase-js'; // Correct import for SupabaseClient

// Define and export NotificationSettings type
export interface NotificationSettings {
  userId: string;
  emailInboundCalls: boolean;
  smsInboundCalls: boolean;
  emailOutboundCallCompletion: boolean;
  smsOutboundCalls: boolean;
  campaignEmailSummary: boolean;
  campaignSmsInitiation: boolean;
}

// Existing functions

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSubscription(supabase: SupabaseClient) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) throw error;
  return subscription;
}

export async function getProducts(supabase: SupabaseClient) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) throw error;
  return products;
}

export async function getUserDetails(supabase: SupabaseClient) {
  const { data: userDetails, error } = await supabase
    .from('users')
    .select('*')
    .single();

  if (error) throw error;
  return userDetails;
}

export async function getMessages(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessage(
  supabase: SupabaseClient,
  messageText: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('messages')
    .insert([{ text: messageText, user_id: user.id }]);

  if (error) throw error;
  return data;
}

// Function to get contacts
export async function getContacts(supabase: SupabaseClient) {
  const { data: contacts, error } = await supabase.from('contacts').select('*');

  if (error) throw error;
  return contacts;
}

// Function to get contact's first name by phone number
export async function getContactFirstName(
  supabase: SupabaseClient,
  phoneNumber: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('first_name')
    .eq('phone', phoneNumber)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
    return null;
  }

  return data?.first_name || null;
}

// Function to get lists
export async function getLists(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: lists, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId); // Filter lists by user_id

  if (error) throw error;
  return lists;
}

// Function to get API keys
export async function getApiKeys(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('api_keys')
    .select(
      'twilio_sid, twilio_auth_token, eleven_labs_key, vapi_key, open_ai_api_key'
    )
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching API keys:', error);
    return null;
  }

  return data;
}

// Function to save API keys
export async function saveApiKeys(
  supabase: SupabaseClient,
  {
    userId,
    twilioSid,
    twilioAuthToken,
    elevenLabsKey,
    vapiKey,
    openAiApiKey,
  }: {
    userId: string;
    twilioSid: string;
    twilioAuthToken: string;
    elevenLabsKey: string;
    vapiKey: string;
    openAiApiKey: string;
  }
) {
  const { data, error } = await supabase
    .from('api_keys')
    .upsert(
      {
        user_id: userId,
        twilio_sid: twilioSid,
        twilio_auth_token: twilioAuthToken,
        eleven_labs_key: elevenLabsKey,
        vapi_key: vapiKey,
        open_ai_api_key: openAiApiKey,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Error saving API keys:', error.message);
    throw new Error('Error saving API keys: ' + error.message);
  }

  console.log('API Keys save result:', data);

  return { success: true, data };
}

// Function to get notification settings
export async function getUserNotificationSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<NotificationSettings | null> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // 'PGRST116' is the error code for "no rows found"
      console.error('Error fetching notification settings:', error);
      return null;
    }

    if (!data) {
      // Return default settings if none exist
      return {
        userId,
        emailInboundCalls: true,
        smsInboundCalls: false,
        emailOutboundCallCompletion: true,
        smsOutboundCalls: true,
        campaignEmailSummary: true,
        campaignSmsInitiation: true,
      };
    }

    return {
      userId: data.user_id,
      emailInboundCalls: data.email_inbound_calls,
      smsInboundCalls: data.sms_inbound_calls,
      emailOutboundCallCompletion: data.email_outbound_call_completion,
      smsOutboundCalls: data.sms_outbound_calls,
      campaignEmailSummary: data.campaign_email_summary,
      campaignSmsInitiation: data.campaign_sms_initiation,
    };
  } catch (err: any) {
    console.error('Unexpected error fetching notification settings:', err);
    return null;
  }
}

// Function to save notification settings
export async function saveNotificationSettings(
  supabase: SupabaseClient,
  settings: NotificationSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notification_settings')
      .upsert(
        {
          user_id: settings.userId,
          email_inbound_calls: settings.emailInboundCalls,
          sms_inbound_calls: settings.smsInboundCalls,
          email_outbound_call_completion: settings.emailOutboundCallCompletion,
          sms_outbound_calls: settings.smsOutboundCalls,
          campaign_email_summary: settings.campaignEmailSummary,
          campaign_sms_initiation: settings.campaignSmsInitiation,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving notification settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error saving notification settings:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
}
