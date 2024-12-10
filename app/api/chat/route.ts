import { NextResponse } from 'next/server';
import { supabase } from 'utils/supabaseClient'; // Named import for Supabase
import { OpenAI } from 'openai';  // Import OpenAI library

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Use the environment variable for the API key
});

// Function to add contacts to Supabase
export async function POST(req: Request) {
  try {
    const { message, context = [] } = await req.json();

    // Prepare messages array with system prompt and context
    const messages = [
      {
        role: 'system',
        content: `You are Ava, an AI assistant built to assist with various tasks including managing contacts and handling requests like adding new contacts to the system.`
      },
      ...context, // Include previous conversation context
      {
        role: 'user',
        content: message
      }
    ];

    // Check if the message asks to add contacts
    if (message.includes('add contacts')) {
      const contactDetails = extractContactDetails(message); // Extract details from message
      const response = await addContactsToSupabase(contactDetails); // Add contacts to Supabase
      return NextResponse.json({ response });
    }

    // Default OpenAI API call if message isn't for adding contacts
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      stream: false
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Error handling the request:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}

// Helper function to extract contact details from user input
function extractContactDetails(message: string) {
  const regex = /add contacts \[(.*?)\]/;  // Regex to extract contact list from the message
  const match = message.match(regex);

  if (match) {
    const contacts = JSON.parse(match[1]); // Assuming the contacts are in JSON format in the message
    return contacts.map((contact: any) => ({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address
    }));
  } else {
    throw new Error('Invalid contact details format');
  }
}

// Function to add contacts to Supabase
async function addContactsToSupabase(contacts: any[]) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contacts.map(contact => ({
        first_name: contact.name.split(' ')[0],
        last_name: contact.name.split(' ')[1],
        email_address: contact.email,
        phone: contact.phone,
        address: contact.address
      })));

    if (error) throw error;

    return `Successfully added ${contacts.length} contacts to your contact list.`;
  } catch (error) {
    console.error('Error adding contacts:', error);
    return 'There was an error while adding the contacts. Please try again.';
  }
}
