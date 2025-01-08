import twilio from 'twilio';

const TWILIO_PHONE_NUMBER = process.env.TWILIO_NUMBER || '';
const DEFAULT_RECIPIENT_PHONE_NUMBER = '+918707279119'; // Default recipient phone number

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface CallReport {
  call_id: string;
  type: string;
  status: string;
  ended_reason: string;
  summary: string;
  stereo_recording_url: string;
  customer_number: string;
  assistant_name: string;
  assistant_model: string;
  assistant_transcriber: string;
  assistant_voice_provider: string;
  assistant_voice_id: string;
  phone_number: string;
  timestamp: string;
}

export async function sendSms(callReport: CallReport ) {
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
}
