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

  // Asynchronous function to send SMS and Email
  (async function() {
    try {
      // Send the SMS with the call report
      await twilioClient.messages.create({
        body: `
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
        `,
        from: TWILIO_PHONE_NUMBER,
        to: DEFAULT_RECIPIENT_PHONE_NUMBER,
      });

      // Send the email with the call report using Resend
      const emailData = await resend.emails.send({
        from: 'info@clicksetgo.com',
        to: DEFAULT_RECIPIENT_EMAIL,
        subject: 'Call Report',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Call Report</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #0d0d0d;
                    color: #e6e6e6;
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #1a1a1a;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    padding: 20px;
                }
                h1 {
                    color: #00c6ff;
                    text-align: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .report-section {
                    margin-bottom: 15px;
                }
                .report-section:last-child {
                    margin-bottom: 0;
                }
                .report-section strong {
                    color: #00c6ff;
                    font-size: 16px;
                }
                .report-section p {
                    margin: 5px 0;
                    padding-left: 10px;
                    border-left: 4px solid #00c6ff;
                    background-color: #1a1a1a;
                    padding: 10px;
                    border-radius: 8px;
                }
                .cta-button {
                    display: inline-block;
                    margin-top: 20px;
                    background-color: #00c6ff;
                    color: #0d0d0d;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                    transition: background-color 0.3s ease;
                }
                .cta-button:hover {
                    background-color: #00a5cc;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Call Report</h1>

                <div class="report-section">
                    <strong>Call ID:</strong>
                    <p>${callReport.call_id}</p>
                </div>

                <div class="report-section">
                    <strong>Type:</strong>
                    <p>${callReport.type}</p>
                </div>

                <div class="report-section">
                    <strong>Status:</strong>
                    <p>${callReport.status}</p>
                </div>

                <div class="report-section">
                    <strong>Ended Reason:</strong>
                    <p>${callReport.ended_reason}</p>
                </div>

                <div class="report-section">
                    <strong>Summary:</strong>
                    <p>${callReport.summary}</p>
                </div>

                <div class="report-section">
                    <strong>Stereo Recording URL:</strong>
                    <p><a href="${callReport.stereo_recording_url}" style="color: #00c6ff;">Listen</a></p>
                </div>

                <div class="report-section">
                    <strong>Customer Number:</strong>
                    <p>${callReport.customer_number}</p>
                </div>

                <div class="report-section">
                    <strong>Assistant Name:</strong>
                    <p>${callReport.assistant_name}</p>
                </div>

                <div class="report-section">
                    <strong>Assistant Model:</strong>
                    <p>${callReport.assistant_model}</p>
                </div>

                <div class="report-section">
                    <strong>Assistant Transcriber:</strong>
                    <p>${callReport.assistant_transcriber}</p>
                </div>

                <div class="report-section">
                    <strong>Assistant Voice Provider:</strong>
                    <p>${callReport.assistant_voice_provider}</p>
                </div>

                <div class="report-section">
                    <strong>Assistant Voice ID:</strong>
                    <p>${callReport.assistant_voice_id}</p>
                </div>

                <div class="report-section">
                    <strong>Phone Number:</strong>
                    <p>${callReport.phone_number}</p>
                </div>

                <div class="report-section">
                    <strong>Timestamp:</strong>
                    <p>${callReport.timestamp}</p>
                </div>

                <div style="text-align: center;">
                    <a href="${callReport.stereo_recording_url}" class="cta-button">Listen to Recording</a>
                </div>

                <div class="footer">
                    <p>&copy; 2024 ClickSetGo. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
      });

      console.log('Email sent successfully:', emailData);

      res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error('Error sending SMS or email:', error);
      res.status(500).json({ error: (error as Error).message || 'Internal Server Error' });
    }
  })();
}
