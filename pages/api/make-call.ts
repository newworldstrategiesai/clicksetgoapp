import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string): string | null => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US');
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const {
      contact,
      reason,
      twilioNumber,
      firstMessage,
      voiceId,
      userId,
      credentials,
      agentSettings, // Added agentSettings
    } = req.body;

    const accountSid = credentials.twilioSid;
    const authToken = credentials.twilioAuthToken;
    const vapi_key = credentials.vapiKey;

    // Default voice ID
    const defaultVoiceId = '9c6NBxIEEDowC6QfhIaO';

    // Check for required fields
    if (
      !contact ||
      !contact.first_name ||
      !contact.phone ||
      !reason ||
      !twilioNumber
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use the provided voiceId or default to the specified defaultVoiceId
    const selectedVoiceId = voiceId || defaultVoiceId;

    // Format phone numbers
    const formattedContactNumber = formatPhoneNumber(contact.phone);
    const formattedTwilioNumber = formatPhoneNumber(twilioNumber);

    // Check if phone numbers are valid
    if (!formattedContactNumber || !formattedTwilioNumber) {
      return res
        .status(400)
        .json({ message: 'Invalid phone number format' });
    }

    // Use the custom firstMessage if provided, otherwise default to a standard message
    const customizedFirstMessage =
      firstMessage ||
      `Hello, this is ${agentSettings.agentName} from ${agentSettings.companyName}. Am I speaking with ${contact.first_name}?`;

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
        twilioAccountSid: accountSid,
        twilioAuthToken: authToken,
      },
      assistantId: '3e90c863-0890-4369-8d4b-512cdb2b6981',
      assistantOverrides: {
        firstMessage: customizedFirstMessage,
        voice: {
          voiceId: selectedVoiceId,
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
              // Use agentSettings to dynamically construct the prompt
              content: `
                        You are ${agentSettings.agentName}, a ${agentSettings.role} from ${agentSettings.companyName}.
                        Purpose of Call: "The purpose of the call is to ${reason}." Keep responses concise, as this is a phone conversation. Ensure you wait for the person to finish speaking before responding.
                        if you didn't get what the user is saying, ask them politely to repeat it.
                        Avoid asking, "How may I help you today?" Remember, you are a salesperson representing the company, so communicate in a professional tone.
                        Do not repeat the closing sentence multiple times. before delivering the closing sentence. If there is prolonged silence, use the closing sentence to wrap up the conversation.
                        If the customer ends the conversation, call the Twilio hungup function to disconnect the call.
                        If the customer asks any questions not related to the product or the call's purpose, answer politely and steer the conversation back on track.
                        If the customer wishes to schedule a consultation, as them date and time for the consultation.
                        Never verbally provide a URL unless requested; URLs should only be sent in SMS form. ${agentSettings.prompt} The current date and time at the beginning of this phone call is: ${new Date().toISOString()}.
                        Here is the contact information we have for the caller: Phone number they are calling from: ${formattedContactNumber}. 
                        If their name is on file: ${contact.first_name || 'unknown'}.
              `,
            },
          ],
        },
        clientMessages: [
          'transcript',
          'hang',
          'function-call',
          'speech-update',
          'metadata',
          'conversation-update',
        ],
      },
    };

    // Ensure environment variables are defined
    const vapiCallUrl = process.env.VAPI_CALL;
    const vapiApiKey = vapi_key;

    if (!vapiCallUrl || !vapiApiKey) {
      return res
        .status(500)
        .json({ message: 'Missing environment variables' });
    }

    try {
      console.log('Payload being sent:', JSON.stringify(callData, null, 2));

      const response = await axios.post(vapiCallUrl, callData, {
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response);

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

      console.log('Response from VAPI API:', response.data);
      res.status(200).json({
        message: 'Call initiated successfully',
        data: response.data,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error initiating call:',
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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
