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
    const { contact, reason } = req.body;

    const formattedPhoneNumber = formatPhoneNumber(contact.phone);

    const callData = {
      customer: {
        number: formattedPhoneNumber,
        name: contact.first_name,
      },
      phoneNumber: {
        fallbackDestination: {
          type: 'number',
          number: formattedPhoneNumber,
        },
        twilioPhoneNumber: '+19014102020',
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      },
      assistantId: 'a8cad288-e468-49de-85ff-00725364c107',
      assistantOverrides: {
        firstMessage: `Hello this is Ben's AI Assistant. Am I speaking with ${contact.first_name}?`,
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are Ben's helpful assistant.\n\nPurpose of Call:\n"The purpose of the call is to ${reason}."\n\nBe very friendly and nice. After placing the order, ask how long it will take and let the person know that you will be there shortly to pick up the food.\n\nKeep responses short as this is a phone conversation. Be sure to wait for the person to stop talking before speaking again.\n`
            }
          ]
        },
        variableValues: {
          name: contact.first_name,
        }
      }
    };

    try {
      console.log('Sending request to VAPI API with data:', callData);
      const response = await axios.post(
        'https://api.vapi.ai/call',
        callData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response from VAPI API:', response.data);
      res.status(200).json({ message: 'Call initiated successfully', data: response.data });
    } catch (error) {
      console.error('Error initiating call:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to initiate call', error: error.response?.data || error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
