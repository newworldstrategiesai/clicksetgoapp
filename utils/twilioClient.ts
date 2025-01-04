// utils/twilioClient.ts
import twilio from 'twilio'; // Default import for Twilio

// Get account SID and Auth Token from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Validate environment variables
if (!accountSid || !authToken) {
  throw new Error('Twilio Account SID and Auth Token must be set in environment variables');
}

// Initialize Twilio client with SID and Auth Token
export const twilioClient = twilio(accountSid, authToken);
