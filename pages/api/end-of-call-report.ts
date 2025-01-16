import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';
import twilio from 'twilio';
import { Resend } from 'resend';
import { supabase } from '@/utils/supabaseClient';
import { sendSms } from './sendSms';
import { sendEmail } from './sendEmail';

// Define the type for the call report
type CallReport = {
  call_id: string;
  org_id: string;
  type: string;
  status: string;
  ended_reason: string;
  transcript: string;
  summary: string;
  messages: string[];
  analysis: string;
  recording_url: string;
  stereo_recording_url: string;
  customer_number: string;
  assistant_name: string;
  assistant_model: string;
  assistant_transcriber: string;
  assistant_voice_provider: string;
  assistant_voice_id: string;
  phone_number: string;
  timestamp: string;
};

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;
  console.log("message from vapi", message);
  if (!message || !message.call) {
    return res.status(400).json({ error: 'Invalid data received' });
  }

  
  const {
    endedReason,
    transcript,
    summary,
    messages,
    startedAt,
    endedAt,
    analysis,
    recordingUrl,
    stereoRecordingUrl,
    assistant,
    call
  } = message;

    const { data, error } = await supabase
      .from('calls')
      .update({
        status: call.status || "NA",
        transcript: transcript || "NA",
        start_time: startedAt || null,
        end_time: endedAt || null,
        summary: summary || "NA",
        analysis: analysis || "NA",
        recording_url: recordingUrl || "NA",
        stereo_recording_url: stereoRecordingUrl || "NA",
      })
      .eq('call_sid', message.call.phoneCallProviderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating call in Supabase:', error);
      return res
        .status(500)
        .json({ message: 'Failed to update call', error });
    }

    const { data: notificationData, error: notificationError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', data.user_id)
        .single();

        if (notificationError) {
          console.error('Error getting Notification settings:', notificationError);
          return res.status(500).json({ message: 'Failed to get Notification settings', error: notificationError });
        }
        
        console.log("notificationData", notificationData);
        const { email_outbound_call_completion, sms_outbound_calls } = notificationData;
    
  // Construct the call report with fallback values
  const callReport: CallReport = {
    call_id: call.id,
    org_id: call.orgId,
    type: call.type || 'Unknown', // Fallback to "Unknown" if the type is missing
    status: call.status || 'Unknown', // Fallback to "Unknown"
    ended_reason: endedReason || 'Unknown', // Fallback to "Unknown"
    transcript: transcript || 'No transcript available',
    summary: summary || 'No summary provided',
    messages: messages || [],
    analysis: analysis || 'No analysis provided',
    recording_url: recordingUrl || 'No recording URL',
    stereo_recording_url: stereoRecordingUrl || 'No stereo recording URL',
    customer_number: call.customer?.number || 'Unknown',
    assistant_name: assistant?.name || 'Unknown', // Fallback for missing assistant name
    assistant_model: assistant?.model?.model || 'Unknown', // Fallback for missing assistant model
    assistant_transcriber: assistant?.transcriber?.provider || 'Unknown',
    assistant_voice_provider: assistant?.voice?.provider || 'Unknown',
    assistant_voice_id: assistant?.voice?.voiceId || 'Unknown',
    phone_number: call.phoneNumberId || 'Unknown',
    timestamp: message.timestamp || new Date().toISOString() // Fallback to current timestamp
  };

  // Asynchronous function to send SMS and Email
  (async function () {
    try {
      // Send the SMS with the call report
      if(sms_outbound_calls){
        await sendSms(callReport);
      }
      // Send the email with the call report using Resend
      if(email_outbound_call_completion){
        await sendEmail(callReport);
      }

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error('Error sending SMS or email:', error);
      res
        .status(500)
        .json({ error: (error as Error).message || 'Internal Server Error' });
    }
  })();
}
