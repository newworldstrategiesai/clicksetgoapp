// pages/api/make-call-dialer.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Define interfaces for strong typing
interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  lead_status: string;
  lead_source: string;
  opt_in_status: boolean;
  notes: string;
  vertical: string;
  sub_category: string;
  preferred_language: string;
}

interface AgentSettings {
  agentName: string;
  role: string;
  companyName: string;
  prompt?: string; // Make prompt optional
  voiceId: string;
}

interface Credentials {
  twilioSid: string;
  twilioAuthToken: string;
  vapiKey: string;
}

interface MakeCallRequestBody {
  contact: Contact;
  reason: string;
  prompt: string;
  twilioNumber: string;
  firstMessage?: string;
  voiceId?: string;
  userId: string;
  credentials: Credentials;
  agentSettings: AgentSettings;
}

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string): string | null => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('Method Not Allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const body: MakeCallRequestBody = req.body;

  // Log the entire request body for debugging
  console.log('Received /api/make-call POST request:', JSON.stringify(body, null, 2));

  const {
    contact,
    reason,
    twilioNumber,
    firstMessage,
    voiceId,
    prompt,
    userId,
    credentials,
    agentSettings,
  } = body;

  // Validate that credentials are present
  if (!credentials) {
    console.error('Missing credentials in request body');
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const { twilioSid, twilioAuthToken, vapiKey } = credentials;

  // Validate that required credential fields are present
  if (!twilioSid || !twilioAuthToken || !vapiKey) {
    console.error('Incomplete credentials provided:', { twilioSid, twilioAuthToken, vapiKey });
    return res.status(400).json({ message: 'Incomplete credentials' });
  }

  // Check for required contact fields
  if (
    !contact ||
    !contact.first_name ||
    !contact.phone
  ) {
    console.error('Missing required contact fields:', contact);
    return res.status(400).json({ message: 'Missing required contact fields' });
  }

  // Check for required call reason
  if (!reason) {
    console.error('Missing reason for call');
    return res.status(400).json({ message: 'Missing reason for call' });
  }

  // Check for Twilio number
  if (!twilioNumber) {
    console.error('Missing Twilio number');
    return res.status(400).json({ message: 'Missing Twilio number' });
  }

  // **Modified Validation: Make 'prompt' Optional**
  if (
    !agentSettings ||
    !agentSettings.agentName ||
    !agentSettings.role ||
    !agentSettings.companyName ||
    !agentSettings.voiceId
    // Removed: || !agentSettings.prompt
  ) {
    console.error('Missing agent settings:', agentSettings);
    return res.status(400).json({ message: 'Missing agent settings' });
  }

  // Format phone numbers
  const formattedContactNumber = formatPhoneNumber(contact.phone);
  const formattedTwilioNumber = formatPhoneNumber(twilioNumber);

  // Check if phone numbers are valid
  if (!formattedContactNumber || !formattedTwilioNumber) {
    console.error('Invalid phone number format:', { contactPhone: contact.phone, twilioNumber });
    return res
      .status(400)
      .json({ message: 'Invalid phone number format' });
  }

  const contextDetails = `
  Contact Name: ${contact.first_name || 'Unknown'} ${contact.last_name || ''}.
  Lead Source: ${contact.lead_source || 'Unknown'}.
  Vertical/Sub-category: ${contact.vertical || 'Unknown'}.
  Preferred Language: ${contact.preferred_language || 'Unknown'}.
  Notes: ${contact.notes || 'None'}.
  Opt-in Status: ${contact.opt_in_status ? 'Opted-in' : 'Not Opted-in'}.
`;

  const toneAdjustments = contact.lead_status === 'cold' 
  ? 'Adopt a more engaging and persuasive tone.' 
  : contact.lead_status === 'warm'
  ? 'Maintain a friendly and professional tone.' 
  : 'Proceed confidently with a closing-oriented tone.';

  // Use the custom firstMessage if provided, otherwise default to a standard message
  const customizedFirstMessage =
    `Hello, this is ${agentSettings.agentName} from ${agentSettings.companyName}. Am I speaking with ${contact.first_name}?`|| firstMessage;
  // **Handle Optional 'prompt'**
  const systemPrompt = `
    You are ${agentSettings.agentName}, a ${agentSettings.role} from ${agentSettings.companyName}.
    Purpose of Call: "The purpose of the call is to ${reason}." Keep responses concise, as this is a phone conversation. Ensure you wait for the person to finish speaking before responding.
    If you didn't get what the user is saying, ask them politely to repeat it.
    Avoid asking, "How may I help you today?" Remember, you are a ${agentSettings.role} representing the company, ${toneAdjustments}.
    Do not repeat the closing sentence multiple times. Before delivering the closing sentence, if there is prolonged silence, use the closing sentence to wrap up the conversation.
    If the customer ends the conversation, call the Twilio hungup function to disconnect the call.
    If the customer asks any questions not related to the product or the call's purpose, answer politely and steer the conversation back on track.
    If the customer wishes to schedule a consultation, ask them for the date and time for the consultation.
    Never verbally provide a URL unless requested; URLs should only be sent in SMS form.${(prompt ||  agentSettings.prompt) ? ' ' + (prompt ||  agentSettings.prompt) : ''}
    ${contextDetails}
    The current date and time at the beginning of this phone call is: ${new Date().toISOString()}.
    Here is the contact information we have for the caller:
    Phone number they are calling from: ${formattedContactNumber}. 
    If their name is on file: ${contact.first_name || 'unknown'}.
  `;

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
      twilioAccountSid: twilioSid,
      twilioAuthToken: twilioAuthToken,
    },
    assistantId: '3e90c863-0890-4369-8d4b-512cdb2b6981',
    assistantOverrides: {
      firstMessage: customizedFirstMessage,
      voice: {
        voiceId: agentSettings.voiceId || voiceId || '9c6NBxIEEDowC6QfhIaO',
        provider: '11labs',
        stability: 0.3,
        similarityBoost: 0.75,
        style: 0.1,
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
        functions: [
          {
            name: 'SendSMS',
            description: "Sends requested info to the caller's phone number",
            serverUrl: 'https://clicksetgo.app/api/send-sms',

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
      clientMessages: [
        'transcript',
        'hang',
        'function-call',
        'speech-update',
        'metadata',
        'conversation-update',
      ],
      serverMessages: [
        'end-of-call-report'
      ],
      serverUrl: 'https://clicksetgo.app/api/end-of-call-report',
      serverUrlSecret: '777333777',
    },
  };

  // Ensure environment variables are defined
  const vapiCallUrl = process.env.VAPI_CALL;
  const vapiApiKey = vapiKey;

  if (!vapiCallUrl || !vapiApiKey) {
    console.error('Missing environment variables VAPI_CALL or VAPI_API_KEY');
    return res
      .status(500)
      .json({ message: 'Missing environment variables' });
  }

  try {
    console.log('Payload being sent to VAPI API:', JSON.stringify(callData, null, 2));

    const response = await axios.post(vapiCallUrl, callData, {
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response from VAPI:', response.data);

    if(response){
      const { data, error } = await supabase
      .from('calls')
      .upsert({
        user_id: userId, // Replace with your variable holding the user ID
        caller_number: response.data.phoneNumber.twilioPhoneNumber, // Replace with your variable for caller_number
        call_sid: response.data.phoneCallProviderId, // Replace with your variable for call_sid
      }, { onConflict: 'call_sid' }); // Specify the unique constraint to resolve conflicts

      if (error) {
        console.error('Error adding new contact to Supabase:', error);
        return res
          .status(500)
          .json({ message: 'Failed to add new contact', error });
      }

    }

    // Check if contact is new
    if (response.data.newContact) {
      const { error } = await supabase.from('contacts').insert([
        {
          ...contact,
          phone: formattedContactNumber,
        },
      ]);

      if (error) {
        console.error('Error adding new contact to Supabase:', error);
        return res
          .status(500)
          .json({ message: 'Failed to add new contact', error });
      }
    }

    res.status(200).json({
      message: 'Call initiated successfully',
      data: response.data,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios Error initiating call:',
        error.response?.data || error.message
      );
      res.status(500).json({
        message: 'Failed to initiate call',
        error: error.response?.data || error.message,
        requestData: callData, // Log request data for debugging
      });
    } else if (error instanceof Error) {
      console.error('Error initiating call:', error.message);
      res.status(500).json({
        message: 'Failed to initiate call',
        error: error.message,
        requestData: callData, // Log request data for debugging
      });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({
        message: 'Failed to initiate call',
        error: 'Unknown error',
        requestData: callData, // Log request data for debugging
      });
    }
  }
}
