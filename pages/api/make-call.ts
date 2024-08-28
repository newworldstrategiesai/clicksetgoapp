import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string): string | null => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { contact, reason, twilioNumber, firstMessage, voiceId } = req.body;

    // Default voice ID
    const defaultVoiceId = '9c6NBxIEEDowC6QfhIaO';

    // Check for required fields
    if (!contact || !contact.first_name || !contact.phone || !reason || !twilioNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use the provided voiceId or default to the specified defaultVoiceId
    const selectedVoiceId = voiceId || defaultVoiceId;

    // Format phone numbers
    const formattedContactNumber = formatPhoneNumber(contact.phone);
    const formattedTwilioNumber = formatPhoneNumber(twilioNumber);

    // Check if phone numbers are valid
    if (!formattedContactNumber || !formattedTwilioNumber) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Use the custom firstMessage if provided, otherwise default to a standard message
    const customizedFirstMessage = firstMessage || `Hello, this is Ben's AI Assistant. Am I speaking with ${contact.first_name}?`;

    const callData = {
      customer: {
        number: formattedContactNumber,
        name: contact.first_name,
      },
      phoneNumber: {
        fallbackDestination: {
          type: 'number',
          number: formattedContactNumber,
        },
        twilioPhoneNumber: formattedTwilioNumber,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      },
      assistantId: 'a8cad288-e468-49de-85ff-00725364c107',
      assistantOverrides: {
        firstMessage: customizedFirstMessage,
        voice: {
          voiceId: selectedVoiceId,
          provider: '11labs',
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.7
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are Ben's helpful assistant.\n\nPurpose of Call:\n"The purpose of the call is to ${reason}."\n\nBe very friendly and nice.\n\nKeep responses short as this is a phone conversation. Be sure to wait for the person to stop talking before speaking again.\nIf the caller would like to schedule a consultation, just send them our Calendly link: (https://calendly.com/m10djcompany/consultation) via SMS. Never verbally speak a URL unless requested by the user. URLs are to be only sent in SMS form to the user. The current date and time at the beginning of this phone call is: ${new Date().toISOString()}. Here is the contact information we have for the caller: Phone number they are calling from is ${formattedContactNumber}. If their name is on file, it is: ${contact.first_name || 'unknown'}. Here is the link to DJ pricing PDF: (https://m10djcompany.com/wp-content/uploads/2024/06/2024-Official-Wedding-Pricing.pdf).`
            }
          ],
          functions: [
            {
              name: 'SendSMS',
              description: "Sends requested info to the caller's phone number",
              parameters: {
                type: 'object',
                required: ['callerNumber', 'callerName', 'smsMessage'],
                properties: {
                  callerName: {
                    type: 'string',
                    description: 'The name of the person receiving the SMS message.'
                  },
                  callerNumber: {
                    type: 'string',
                    description: "The end user's phone number to be used with SMS messaging."
                  },
                  smsMessage: {
                    type: 'string',
                    description: 'The SMS message content containing requested info.'
                  }
                }
              }
            }
          ]
        },
        // Add client and server messages, server URL, and end call phrases
        clientMessages: [
          'transcript',
          'hang',
          'function-call',
          'speech-update',
          'metadata',
          'conversation-update'
        ],
        serverMessages: [
          'end-of-call-report'
        ],
        serverUrl: 'https://clicksetgo.app/api/end-of-call-report',
        endCallPhrases: ['goodbye'],
        serverUrlSecret: '777333777',
      }
    };

    try {
      console.log('Payload being sent:', JSON.stringify(callData, null, 2));
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

      // Check if contact is new
      if (response.data.newContact) {
        const { error } = await supabase
          .from('contacts')
          .insert([{
            ...contact,
            phone: formattedContactNumber
          }]);

        if (error) {
          console.error('Error adding new contact to Supabase:', error);
          return res.status(500).json({ message: 'Failed to add new contact', error });
        }
      }

      console.log('Response from VAPI API:', response.data);

      // Send end-of-call report
      await axios.post(
        'https://clicksetgo.app/api/end-of-call-report',
        {
          message: {
            call: {
              customer: {
                number: formattedContactNumber,
                name: contact.first_name,
              },
              assistant: callData.assistantOverrides,
              reason,
              twilioNumber: formattedTwilioNumber,
              timestamp: new Date().toISOString(),
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.status(200).json({ message: 'Call initiated and end-of-call report sent successfully', data: response.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error initiating call:', error.response?.data || error.message);
        res.status(500).json({
          message: 'Failed to initiate call',
          error: error.response?.data || error.message,
          requestData: callData // Log request data for debugging
        });
      } else if (error instanceof Error) {
        console.error('Error initiating call:', error.message);
        res.status(500).json({
          message: 'Failed to initiate call',
          error: error.message,
          requestData: callData // Log request data for debugging
        });
      } else {
        console.error('Unknown error:', error);
        res.status(500).json({
          message: 'Failed to initiate call',
          error: 'Unknown error',
          requestData: callData // Log request data for debugging
        });
      }
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
