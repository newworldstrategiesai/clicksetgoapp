import axios from 'axios';

const formatPhoneNumber = (phoneNumber) => {
  // Ensure the phone number is in E.164 format
  if (!phoneNumber.startsWith('+')) {
    return `+${phoneNumber.replace(/[^0-9]/g, '')}`;
  }
  return phoneNumber;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { campaignId, contacts, schedule, reason } = req.body;

    if (!campaignId || !contacts || !Array.isArray(contacts) || contacts.length === 0 || !schedule || !reason) {
      return res.status(400).json({ message: 'Invalid request body' });
    }
    const calls = contacts.map(contact => ({
      customer: {
        number: formatPhoneNumber(contact.phone),
        name: contact.first_name,
      },
      phoneNumber: {
        fallbackDestination: {
          type: 'number',
          number: formatPhoneNumber(contact.phone),
        },
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      },
      assistantId: process.env.VAPI_ASSISTANT_ID || 'd1070629-bbd4-4a39-bb68-f0bcef1da950',
      assistantOverrides: {
        firstMessage: `Hello this is Ben's AI Assistant. Am I speaking with ${contact.first_name}?`,
        model: {
          provider: 'openai',
          model: process.env.VAPI_MODEL || 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are Ben's helpful assistant.\n\nPurpose of Call:\n"The purpose of the call is to ${reason}."\n\nBe very friendly and nice. \n\nKeep responses short as this is a phone conversation. Be sure to wait for the person to stop talking before speaking again.\n`
            }
          ]
        },
        variableValues: {
          name: contact.first_name,
        }
      }
    }));

    try {
      console.log('Scheduling calls:', calls);
      const response = await axios.post(
        'https://api.vapi.ai/schedule',
        { calls, schedule },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response from VAPI API:', response.data);
      res.status(200).json({ message: 'Campaign scheduled successfully', data: response.data });
    } catch (error) {
      console.error('Error scheduling campaign:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to schedule campaign', error: error.response?.data || error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
