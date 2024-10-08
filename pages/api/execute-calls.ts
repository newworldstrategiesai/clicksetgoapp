// pages/api/execute-calls.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data: tasks, error: fetchError } = await supabase
      .from('call_tasks')
      .select('*')
      .eq('call_status', 'Pending') // Only get pending tasks
      .lt('scheduled_at', new Date().toISOString()); // Check if scheduled_at is in the past

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

      // Prepare data for the call
      const callData = {
        contact: {
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone,
        },
        reason: task.call_subject,
        twilioNumber: task.twilioNumber || '+19014102020',
        firstMessage: task.first_message || `Calling ${contact.first_name} regarding ${task.call_subject}`,
        voiceId: 'your_voice_id_here', // Or any other data needed for the call
        // Add your Twilio and VAPI keys as necessary
      };

      try {
        const response = await axios.post('/api/make-call', callData); // Adjust the URL if necessary

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
