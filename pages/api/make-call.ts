import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/utils/supabaseClient';
import { parsePhoneNumberFromString } from 'libphonenumber-js'; // Import the library

// Utility function to format phone numbers in E.164 format
const formatPhoneNumber = (phoneNumber: string): string | null => {
  const phoneNumberObject = parsePhoneNumberFromString(phoneNumber, 'US'); // You can set the default region if needed
  return phoneNumberObject ? phoneNumberObject.format('E.164') : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { contact, reason, twilioNumber } = req.body;

    // Check for required fields
    if (!contact || !contact.first_name || !contact.phone || !reason || !twilioNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Format phone numbers
    const formattedContactNumber = formatPhoneNumber(contact.phone);
    const formattedTwilioNumber = formatPhoneNumber(twilioNumber);

    // Check if phone numbers are valid
    if (!formattedContactNumber || !formattedTwilioNumber) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

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
        firstMessage: `Hello this is Ben's AI Assistant. Am I speaking with ${contact.first_name}?`,
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo',
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
      res.status(200).json({ message: 'Call initiated successfully', data: response.data });
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
