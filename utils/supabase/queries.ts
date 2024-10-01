import { SupabaseClient } from '@/server';

// Existing functions

export async function getUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
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

export async function sendMessage(supabase: SupabaseClient, messageText: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('messages')
    .insert([{ text: messageText, user_id: user.id }]);

  if (error) throw error;
  return data;
}

// Add this function to get contacts
export async function getContacts(supabase: SupabaseClient) {
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*');

  if (error) throw error;
  return contacts;
}

// New function to get contact's first name by phone number
export async function getContactFirstName(supabase: SupabaseClient, phoneNumber: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('first_name')
    .eq('phone', phoneNumber)
    .single(); // Use single() for a single expected result

  if (error) {
    console.error('Error fetching contact:', error);
    return null; // Or handle the error as appropriate
  }

  return data?.first_name || null;
}

// New function to get lists
export async function getLists(supabase: SupabaseClient, userId: string) {
  const { data: lists, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId); // Filter lists by user_id

  if (error) throw error;
  return lists;
}

// Function to get API keys
export async function getApiKeys(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('twilio_sid, twilio_auth_token, eleven_labs_key, vapi_key, open_ai_api_key') // Include OpenAI API key
    .eq('user_id', userId)
    .single(); // Ensure you get a single row

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
    openAiApiKey, // Add OpenAI API key
  }: {
    userId: string;
    twilioSid: string;
    twilioAuthToken: string;
    elevenLabsKey: string;
    vapiKey: string;
    openAiApiKey: string; // Include OpenAI API key type
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
        open_ai_api_key: openAiApiKey, // Save OpenAI API key
      },
      { onConflict: 'user_id' } // This ensures that it updates if the record already exists
    );

  if (error) {
    console.error('Error saving API keys:', error.message);
    throw new Error('Error saving API keys: ' + error.message);
  }

  console.log('API Keys save result:', data);

  // Return the result explicitly
  return { success: true, data };
}
