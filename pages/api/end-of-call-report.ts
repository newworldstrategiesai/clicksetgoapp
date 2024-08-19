import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';
import twilio from 'twilio';
import { Resend } from 'resend';

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

const TWILIO_PHONE_NUMBER = '+19014102020'; // Twilio phone number
const DEFAULT_RECIPIENT_PHONE_NUMBER = '+19014977001'; // Default recipient phone number
const DEFAULT_RECIPIENT_EMAIL = 'ben@newworldstrategies.ai'; // Default recipient email

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;

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

  // Construct the call report
  const callReport: CallReport = {
    call_id: call.id,
    org_id: call.orgId,
    type: call.type,
    status: call.status,
    ended_reason: endedReason,
    transcript,
    summary,
    messages,
    analysis,
    recording_url: recordingUrl,
    stereo_recording_url: stereoRecordingUrl,
    customer_number: call.customer.number,
    assistant_name: call.assistant.name,
    assistant_model: call.assistant.model.model,
    assistant_transcriber: call.assistant.transcriber.provider,
    assistant_voice_provider: call.assistant.voice.provider,
    assistant_voice_id: call.assistant.voice.voiceId,
    phone_number: call.phoneNumberId,
    timestamp: message.timestamp,
  };

  // Format the message body
  const messageBody = `
  Call Report:
  - Call ID: ${callReport.call_id}
  - Type: ${callReport.type}
  - Status: ${callReport.status}
  - Ended Reason: ${callReport.ended_reason}
  - Summary: ${callReport.summary}
  - Stereo Recording URL: ${callReport.stereo_recording_url}
  - Customer Number: ${callReport.customer_number}
  - Assistant Name: ${callReport.assistant_name}
  - Assistant Model: ${callReport.assistant_model}
  - Assistant Transcriber: ${callReport.assistant_transcriber}
  - Assistant Voice Provider: ${callReport.assistant_voice_provider}
  - Assistant Voice ID: ${callReport.assistant_voice_id}
  - Phone Number: ${callReport.phone_number}
  - Timestamp: ${callReport.timestamp}
  `;

  try {
    // Send the SMS with the call report
    await twilioClient.messages.create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: DEFAULT_RECIPIENT_PHONE_NUMBER,
    });

    // Send the email with the call report using Resend
    await resend.emails.send({
      from: 'info@clicksetgo.com',
      to: DEFAULT_RECIPIENT_EMAIL,
      subject: 'Call Report',
      html: `
      <h1>Call Report</h1>
      <p><strong>Call ID:</strong> ${callReport.call_id}</p>
      <p><strong>Type:</strong> ${callReport.type}</p>
      <p><strong>Status:</strong> ${callReport.status}</p>
      <p><strong>Ended Reason:</strong> ${callReport.ended_reason}</p>
      <p><strong>Summary:</strong> ${callReport.summary}</p>
      <p><strong>Stereo Recording URL:</strong> <a href="${callReport.stereo_recording_url}">Listen</a></p>
      <p><strong>Customer Number:</strong> ${callReport.customer_number}</p>
      <p><strong>Assistant Name:</strong> ${callReport.assistant_name}</p>
      <p><strong>Assistant Model:</strong> ${callReport.assistant_model}</p>
      <p><strong>Assistant Transcriber:</strong> ${callReport.assistant_transcriber}</p>
      <p><strong>Assistant Voice Provider:</strong> ${callReport.assistant_voice_provider}</p>
      <p><strong>Assistant Voice ID:</strong> ${callReport.assistant_voice_id}</p>
      <p><strong>Phone Number:</strong> ${callReport.phone_number}</p>
      <p><strong>Timestamp:</strong> ${callReport.timestamp}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Internal Server Error';
    console.error('Error sending SMS or email:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
