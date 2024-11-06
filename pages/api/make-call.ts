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

    const { contact, reason, twilioNumber, firstMessage, voiceId, userId, credentials } = req.body;

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
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Use the custom firstMessage if provided, otherwise default to a standard message
    const customizedFirstMessage =
      firstMessage ||
      `Hello, this is Sarah from I T Niche. Am I speaking with ${contact.first_name}?`;

    const callData = {
      customer: {
        number: formattedContactNumber,
        name: contact.first_name
      },
      phoneNumber: {
        fallbackDestination: {
          type: 'number',
          number: formattedContactNumber
        },
        twilioPhoneNumber: formattedTwilioNumber,
        twilioAccountSid: accountSid,
        twilioAuthToken: authToken
      },
      // d1070629-bbd4-4a39-bb68-f0bcef1da950
      // a8cad288-e468-49de-85ff-00725364c107
      assistantId: 'd1070629-bbd4-4a39-bb68-f0bcef1da950',
      assistantOverrides: {
        firstMessage: customizedFirstMessage,
        voice: {
          voiceId: selectedVoiceId,
          provider: '11labs',
          stability: 0.30,
          similarityBoost: 0.75,
          style: 0.1
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              //Introduce a promotion, where I T Niche is providing free website for Individual or a business, which will help them generate leads and boost their brands online presence.
              content: `You are Sarah, a Sales representative from I T Niche.
                        Purpose of Call: "The purpose of the call is to ${reason}."
                        In the opening script, introduce the product and the reason for the call, then ask if the user is interested.
                        Be friendly and personable.
                        Keep responses concise, as this is a phone conversation. Ensure you wait for the person to finish speaking before responding.
                        if you didn't get what the user is saying, ask them politely to repeat it.
                        Avoid asking, "How may I help you today?" Remember, you are a salesperson representing the company, so communicate in a professional tone.
                        Do not repeat the closing sentence multiple times. before delivering the closing sentence. If there is prolonged silence, use the closing sentence to wrap up the conversation.
                        If the customer ends the conversation, call the Twilio hungup function to disconnect the call.
                        If the customer asks any questions not related to the product or the call's purpose, answer politely and steer the conversation back on track.
                        If the customer wishes to schedule a consultation, as them date and time for the consultation.
                        Never verbally provide a URL unless requested; URLs should only be sent in SMS form.
                        The current date and time at the beginning of this phone call is: ${new Date().toISOString()}.
                        Here is the contact information we have for the caller: Phone number they are calling from: ${formattedContactNumber}. 
                        If their name is on file: ${contact.first_name || 'unknown'}.`
            }
          ],
          // functions: [
          //   {
          //     name: 'SendSMS',
          //     description: "Sends requested info to the caller's phone number",
          //     serverUrl: process.env.CSGSENDSMSURL,

          //     parameters: {
          //       type: 'object',
          //       required: ['callerNumber', 'callerName', 'smsMessage'],
          //       properties: {
          //         callerName: {
          //           type: 'string',
          //           description:
          //             'The name of the person receiving the SMS message.'
          //         },
          //         callerNumber: {
          //           type: 'string',
          //           description:
          //             "The end user's phone number to be used with SMS messaging."
          //         },
          //         smsMessage: {
          //           type: 'string',
          //           description:
          //             'The SMS message content containing requested info.'
          //         }
          //       }
          //     }
          // ]
        },
        clientMessages: [
          'transcript',
          'hang',
          'function-call',
          'speech-update',
          'metadata',
          'conversation-update'
        ],
        // serverMessages: ['end-of-call-report'],
        // serverUrl: process.env.END_OF_CALL_REPORT,
        // serverUrlSecret: '777333777'
      }
    };

    // Ensure environment variables are defined
    const vapiCallUrl = process.env.VAPI_CALL;
    const vapiApiKey = vapi_key;


    if (!vapiCallUrl || !vapiApiKey) {
      return res.status(500).json({ message: 'Missing environment variables' });
    }

    try {
      console.log('Payload being sent:', JSON.stringify(callData, null, 2));

      const response = await axios.post(vapiCallUrl, callData, {
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if contact is new
      if (response.data.newContact) {
        const { error } = await supabase.from('contacts').insert([
          {
            ...contact,
            phone: formattedContactNumber
          }
        ]);

        if (error) {
          console.error('Error adding new contact to Supabase:', error);
          return res
            .status(500)
            .json({ message: 'Failed to add new contact', error });
        }
      }

      console.log('Response from VAPI API:', response.data);
      res
        .status(200)
        .json({ message: 'Call initiated successfully', data: response.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error initiating call:',
          error.response?.data || error.message
        );
        res.status(500).json({
          message: 'Failed to initiate call 1',
          error: error.response?.data || error.message,
          requestData: callData // Log request data for debugging
        });
      } else if (error instanceof Error) {
        console.error('Error initiating call:', error.message);
        res.status(500).json({
          message: 'Failed to initiate call 2',
          error: error.message,
          requestData: callData // Log request data for debugging
        });
      } else {
        console.error('Unknown error:', error);
        res.status(500).json({
          message: 'Failed to initiate call 3',
          error: 'Unknown error',
          requestData: callData // Log request data for debugging
        });
      }
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
// Ben's Content
// content: `You are Ben's helpful assistant.\n\nPurpose of Call:\n"The purpose of the call is to ${reason}."\n\nBe very friendly and nice. \n\nKeep responses short as this is a phone conversation. Be sure to wait for the person to stop talking before speaking again.\n Do not ask them "how may I help you today" and you are a sales person in company, You want to sell your product, so communicate as in professional manner and tone.\n If the customer finishes up the conversation automatically disconnect the call after 10 sec. \n If asked any question other than the product or the purpose of the call, politly revert the conversation on the track. \nDo not repeat the closing sentence multiple times. Instead, wait to see if there is a pause or "dead-air" of more than 7 seconds before saying the closing sentence. If there is a prolonged silence, use the closing sentence to wrap up the conversation. \nIf the caller would like to schedule a consultation, just send them our Calendly link: (https://calendly.com/m10djcompany/consultation) via SMS. Never verbally speak a URL unless requested by the user. URL's are to be only sent in SMS form to the user. The current date and time at the beginning of this phone call is: ${new Date().toISOString()}. Here is the contact information we have for the caller: Phone number they are calling from is ${formattedContactNumber}. If their name is on file, it is: ${contact.first_name || 'unknown'}. Here is the link to DJ pricing PDF: (https://m10djcompany.com/wp-content/uploads/2024/06/2024-Official-Wedding-Pricing.pdf)`

