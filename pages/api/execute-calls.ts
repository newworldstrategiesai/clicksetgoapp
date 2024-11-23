// pages/api/execute-calls.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const credentials = req.body.credentials;
  const userId = req.body.userId

  console.log(credentials, userId)

  if (req.method === 'POST') {
    const { data: tasks, error: fetchError } = await supabase
      .from('call_tasks')
      .select('*')
      .eq('call_status', 'Pending') // Only get pending tasks
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
        };

        if (agentError) {
          console.error('Error fetching agent settings:', agentError);
        } else if (agentData && agentData.length > 0) {

        } else {
          console.warn('No agent settings found for the user.');
        }

      // Prepare data for the call
      const callData = {
        contact: {
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone,
        },
        reason: task.call_subject,
        twilioNumber: task.twilioNumber || process.env.TWILIO_NUMBER,
        firstMessage: task.first_message || `Calling ${contact.first_name} regarding ${task.call_subject}`,
        voiceId: 'CwhRBWXzGAHq8TQ4Fs17', // Or any other data needed for the call
        credentials,
        agentSettings: {
          agentName: agentSettings.agent_name,
          role: agentSettings.role,
          companyName: agentSettings.company_name,
          prompt: agentSettings.prompt,
        },
        // Add your Twilio and VAPI keys as necessary
      };
      console.log("call data from execute call",callData);

      try {
        const response = await axios.post('https://clicksetgo.app/api/make-call', callData); // Adjust the URL if necessary

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
