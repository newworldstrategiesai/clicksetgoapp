import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';
import twilio from 'twilio';
import { Resend } from 'resend';
import { supabase } from '@/utils/supabaseClient';
import { getUser } from '@/utils/supabase/queries';

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

const TWILIO_PHONE_NUMBER = process.env.TWILIO_NUMBER || ''; // Twilio phone number
const DEFAULT_RECIPIENT_PHONE_NUMBER = '+19014977001'; // Default recipient phone number
const DEFAULT_RECIPIENT_EMAIL = 'ben@newworldstrategies.ai'; // Default recipient email


// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

import { sendSms } from './sendSms';
import { sendEmail } from './sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const user = await getUser(supabase)

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' }); // Handle the case where user is null
    }
    
    const {data, error} = await supabase
    .from('api_keys')
    .select('*')
    .eq("user_id", user.id)
    .single();

    const accountSid = data.twilioSid;
    const authToken = data.twilioAuthToken;

    const twilioClient = twilio(accountSid, authToken);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message, sendSmsToggle = false, sendEmailToggle = false } = req.body; // Added toggle values with defaults

  if (!message || !message.call) {
    return res.status(400).json({ error: 'Invalid data received' });
  }

  const {
    endedReason,
    transcript,
    summary,
    messages,
    analysis,
    recordingUrl,
    stereoRecordingUrl,
    call,
  } = message;

  // Construct the call report with fallback values
  const callReport: CallReport = {
    call_id: call.id,
    org_id: call.orgId,
    type: call.type || "Unknown", // Fallback to "Unknown" if the type is missing
    status: call.status || "Unknown", // Fallback to "Unknown"
    ended_reason: endedReason || "Unknown", // Fallback to "Unknown"
    transcript: transcript || "No transcript available",
    summary: summary || "No summary provided",
    messages: messages || [],
    analysis: analysis || "No analysis provided",
    recording_url: recordingUrl || "No recording URL",
    stereo_recording_url: stereoRecordingUrl || "No stereo recording URL",
    customer_number: call.customer?.number || "Unknown",
    assistant_name: call.assistant?.name || "Unknown", // Fallback for missing assistant name
    assistant_model: call.assistant?.model?.model || "Unknown", // Fallback for missing assistant model
    assistant_transcriber: call.assistant?.transcriber?.provider || "Unknown",
    assistant_voice_provider: call.assistant?.voice?.provider || "Unknown",
    assistant_voice_id: call.assistant?.voice?.voiceId || "Unknown",
    phone_number: call.phoneNumberId || "Unknown",
    timestamp: message.timestamp || new Date().toISOString(), // Fallback to current timestamp
  };

  // Check if SMS sending is enabled
  if (sendSmsToggle) {
    await sendSms(callReport);
  } else {
    return res.status(403).json({ error: 'SMS sending is disabled' });
  }

  // Check if Email sending is enabled
  if (sendEmailToggle) {
    await sendEmail(callReport);
  } else {
    return res.status(403).json({ error: 'Email sending is disabled' });
  }

  res.status(200).json({ success: true });
}
