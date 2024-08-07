import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';
import twilio from 'twilio';

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

const TWILIO_PHONE_NUMBER = '+19014202020'; // Twilio phone number
const DEFAULT_RECIPIENT_PHONE_NUMBER = '+19014977001'; // Default recipient phone number

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

  // Format the message
  const messageBody = `
  Call Report:
  - Call ID: ${callReport.call_id}
  - Type: ${callReport.type}
  - Status: ${callReport.status}
  - Ended Reason: ${callReport.ended_reason}
  - Transcript: ${callReport.transcript}
  - Summary: ${callReport.summary}
  - Analysis: ${callReport.analysis}
  - Recording URL: ${callReport.recording_url}
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

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Internal Server Error';
    console.error('Error sending SMS:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
