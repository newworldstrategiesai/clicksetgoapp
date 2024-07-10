// pages/api/send-sms.js

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export default async function handler(req, res) {
  try {
    const { to, message } = req.body;

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber, // Your Twilio phone number from .env
      to: to, // The number you want to send the message to
    });

    res.status(200).json({ success: true, message: 'Message sent successfully', data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
}
