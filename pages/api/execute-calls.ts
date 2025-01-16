// pages/api/execute-calls.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';
import { supabaseServer } from '@/utils/supabaseServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // const credentials = req.body.credentials;
  // const userId = req.body.userId

  // console.log(credentials, userId)

  if (req.method === 'POST') {

    const { data: tasks, error: fetchError } = await supabase
      .from('call_tasks')
      .select('*')
      .eq('call_status', 'Scheduled') // Only get pending tasks
      .lt('scheduled_at', new Date().toISOString()); // Check if scheduled_at is in the past
      console.log("execute call tasks",tasks);

    if (fetchError) {
      console.error('Error fetching call tasks:', fetchError.message);
      return res.status(500).json({ message: 'Failed to fetch call tasks' });
    }

    for (const task of tasks) {
      // Fetch the contact and API keys (you may want to optimize this)
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', task.contact_id)
        .single();

      if (contactError || !contact) {
        console.error('Error fetching contact details:', contactError?.message);
        continue; // Skip this task if contact not found
      }

      const userId = contact.user_id;

      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

        const agentSettings = agentData && agentData.length > 0 ? agentData[0] : {
          agent_name: '',
          role: '',
          company_name: '',
          prompt: '',
          default_voice: '',
        };

        if (agentError) {
          console.error('Error fetching agent settings:', agentError);
        } else if (agentData && agentData.length > 0) {

        } else {
          console.warn('No agent settings found for the user.');
        }

      const { data: apiData, error:apiError } = await supabaseServer
        .from('api_keys'as any)
        .select('eleven_labs_key, twilio_sid, twilio_auth_token, vapi_key') // Replace 'some_column' with the actual column for API key
        .eq('user_id', userId) // Use the fetched user ID
        .single();

        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('country_code, prompt')
          .eq('id', task.campaign_id)
          .single();

        console.log(campaign?.country_code)
        if (campaignError) {
          console.error('Error fetching campaign:', campaignError.message);
          return;
        }

        const countryCode = campaign?.country_code || '+1';
        const tenDigitNum = contact.phone.slice(-10);
        const phoneNumber = `${countryCode}${tenDigitNum}`
        // const phoneNumber = contact.phone.startsWith(countryCode)
        //   ? contact.phone
        //   : `${countryCode}${contact.phone}`;

  if (apiError) {
    console.error('Error fetching API keys:', apiError.message);
    return res.status(500).json({ message: 'Failed to fetch API keys' });
  }
  
  if (!apiData) {
    console.error('API keys not found for the user.');
    return res.status(404).json({ message: 'API keys not found' });
  }

  const apiKey = apiData.eleven_labs_key;
  const twilioSid = apiData.twilio_sid;
  const twilioAuthToken = apiData.twilio_auth_token;
  const vapiKey = apiData.vapi_key;

  const credentials ={
    apiKey,
    twilioSid,
    twilioAuthToken,
    vapiKey
  }

  let twilioNumbers = [];
      try {
        const twilioClient = { twilioSid, twilioAuthToken };

        const response = await axios.post('https://clicksetgo.app/api/get-twilio-numbers', {
          userId,
          twilioClient,
        });

        twilioNumbers = response.data.allNumbers || [];
      } catch (error) {
        console.error('Error fetching Twilio numbers:');
        continue;
      }

      // Select a Twilio number to use
      const selectedTwilioNumber = twilioNumbers.length > 0 ? twilioNumbers[0].phoneNumber : process;

      // Prepare data for the call
      const callData = {
        contact: {
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: phoneNumber,
          lead_status: contact.lead_status,
          lead_source: contact.lead_source,
          notes: contact.notes,
          preferred_language: contact.preferred_language,
          opt_in_status: contact.opt_in_status,
          vertical: contact.vertical,
          sub_category: contact.sub_category,
        },
        prompt:campaign.prompt,
        reason: task.call_subject,
        twilioNumber: selectedTwilioNumber,
        firstMessage: task.first_message || `Calling ${contact.first_name} regarding ${task.call_subject}`,
        voiceId: '', //'CwhRBWXzGAHq8TQ4Fs17', // Or any other data needed for the call
        userId,
        credentials,
        agentSettings: {
          agentName: agentSettings.agent_name,
          role: agentSettings.role,
          companyName: agentSettings.company_name,
          prompt: agentSettings.prompt,
          voiceId: agentSettings.default_voice,
        },
        // Add your Twilio and VAPI keys as necessary
      };
      console.log("call data from execute call",callData);

      try {
        const response = await axios.post('https://clicksetgo.app/api/make-call', callData); // Adjust the URL if necessary
        console.log('Call initiated:', response.data);
        // Update call task status to completed
        await supabase
          .from('call_tasks')
          .update({ call_status: 'Completed' })
          .eq('id', task.id);
        
        console.log('Call executed for task:', task.id);
        
      } catch (error) {
        console.error('Failed to initiate call:', error);
        // Optionally update the task status to 'Failed' or log the error
      }
    }

    return res.status(200).json({ message: 'Processed scheduled calls' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
