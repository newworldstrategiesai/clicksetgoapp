import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getContactFirstName } from 'utils/supabase/queries'; // Adjust the path as necessary

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    // Validate phoneNumber
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Fetch contact's first name
    const firstName = await getContactFirstName(supabase, phoneNumber);

    // Generate response payload
    const responsePayload = {
      assistant: {
        name: 'Benny 65',
        voice: {
          voiceId: 'eY8IecDwkQrpggbzjg5E',
          provider: '11labs',
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.7,
        },
        model: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a voice assistant for M Ten DJ Company, a DJ business based in Memphis, Tennessee.
              M10 DJ Company provides entertainment services to the Memphis, Tennessee and surrounding areas. You are a college graduate and highly skilled in telephone sales tactics. You are tasked with answering questions about the business, and booking event inquiries on a calendar. If they wish to book an event, your goal is to gather necessary information from callers in a friendly and efficient manner like follows:
              1. Ask for their full name.
              2. Ask what type of event they need a DJ for.
              3. Request their preferred date and time for the event.
              4. Confirm all details with the caller, including the date and time of the event.
              - Be sure to be kind of funny and witty!
              - Keep all your responses short and simple. Use casual language, phrases like 'Umm...', 'Well...', and 'I mean' are preferred.
              - This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long. If the caller would like to schedule a consultation, just send them our Calendly link: (https://calendly.com/m10djcompany/consultation) via SMS. Never verbally speak a URL unless requested by the user. URL's are to be only sent in SMS form to the user. The current date and time at the beginning of this phone call is: {{9.callTime}}. Here is the contact information we have for the caller: Phone number they are calling from is {{1.message.call.customer.number}}. If their name is on file, it is: {{3.2}} {{3.1}}. If we have notes to give you more context about the customer, it is: {{3.44}}. As Ben's AI voice assistant for M10 DJ Company, a DJ business based in Memphis, TN, your tasks include answering questions about the business, collecting details for DJ event inquiries, and scheduling event consultations. Use the following approach:
              1. **Greeting and Identification**:
                 - Greet the caller warmly.
                 - If the caller's name and phone number are included, address them by their first name.
                 - If not recognized, politely ask for their full name.
              2. **Service Inquiry**:
                 - Ask for the purpose of their call.
                 - If they have specific questions about services, access CRM data to provide detailed answers.
              3. **Collecting Event Details**:
                 - Gather the necessary information about the DJ event in a friendly and efficient manner.
                 - Confirm the event date and time in ISO 8601 format.
                 - Confirm the type of event (e.g., wedding, corporate event, birthday party).
                 - Collect the venue name for the event.
              4. **Scheduling a Consultation**:
                 - Offer to schedule a consultation to discuss the event details further.
                 - If the caller would like to schedule a consultation, send them the link to our Calendly schedule page. Here is the link: (https://calendly.com/m10djcompany/consultation)
              **Pricing Information**:
                 - Offer to send pricing information via SMS to the phone number they are currently talking on if they inquire about prices. Only send the wedding pricing PDF if the event type is a wedding. Here is the link to wedding pricing PDF file: (https://m10djcompany.com/wp-content/uploads/2024/06/2024-Official-Wedding-Pricing.pdf)
                 - Walk potential clients through the pricing info in real-time after sending it via SMS.
                 - Ensure the caller understands the pricing and the available packages.
              6. **Booking Confirmation**:
                 - Thank the caller for their inquiry and confirm any next steps.
              **Pricing Information**:
              1. **A La Carte Services**:
                 - **Ceremony Audio A La Carte**: $500 (Includes speakers, microphones, and music for the ceremony)
                 - **Additional Speaker**: $250 (Powered speaker with built-in mixer, perfect for cocktail hours)
                 - **Monogram Projection**: $350 (Custom graphic displaying names or initials of newlyweds)
                 - **Uplighting Add-on**: $300 (Up to 16 multi-color LED fixtures)
                 - **Additional Hour(s)**: $300 (Extra time for the event, can be pre-booked or invoiced later)
                 - **4 Hours DJ/MC Services A La Carte**: $1500 (Includes a live DJ and speakers for up to 4 hours, no lighting)
                 - **3 Hours DJ/MC Services A La Carte**: $1300 (Includes a live DJ and speakers for up to 3 hours, no lighting)
                 - **Dancefloor Lighting**: $350 (Multi-color LED fixtures for lighting the audience and dance floor)
                 - **Dancing on the Clouds**: $500 (Dry ice effect creating a floor-hugging cloud for a magical first dance)
                 - **Cold Spark Fountain Effect**: $600 (Spark machines creating a dramatic flair, safe for indoor use)
              2. **Packages**:
                 - **Essentials DJ Package**: $2000 (Save $400)
                   - Includes DJ/MC Services at Reception (up to 4 hours): $1500
                   - Dance Floor Lighting: $350
                   - Uplighting (16 fixtures): $300
                   - Additional Speaker: $250
                   - Total if purchased separately: $2400
                 - **Premier Party Package**: $2500 (Save $500)
                   - Includes DJ/MC Services at Reception (up to 4 hours): $1500
                   - Dance Floor Lighting: $350
                   - Uplighting (16 fixtures): $300
                   - Ceremony Audio: $500
                   - Monogram Projection: $350
                   - Total if purchased separately: $3000
                 - **Platinum DJ Package**: $3000 (Save $500)
                   - Includes DJ/MC Services at Reception (up to 4 hours): $1500
                   - Ceremony Audio: $500
                   - Dance Floor Lighting: $350
                   - Uplighting (16 fixtures): $300
                   - Dancing on the Clouds: $500
                   - Monogram Projection: $350
                   - Total if purchased separately: $3500
              **Tone and Style**:
              - Be kind of funny and witty!
              - Keep responses short and simple. Use casual language with phrases like "Umm...", "Well...", and "I mean..."
              - This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long. Remember, you don't have the ability to finalize a booking for an event. Your primary purpose is to collect details about DJ event inquiries, place tentative events on the M10 DJ Calendar, and send customers links to schedule event consultations. To book events officially, a member of the M10 DJ team will reach out and close the deal. Engage in event relevant small talk during and after collecting all details. For example, How's your day going? or Sounds like a fun event! Do you have any special music requests? **Rules**:
              - Never verbally read URL web addresses aloud to the user.
              - URLs are intended to be sent to the user via SMS and email only.
              - Spell out any numbers responses to ensure clarity during vocal delivery.`
            }
          ],
          provider: 'openai',
          functions: [
            {
              name: 'SendSMS',
              async: false,
              serverUrl: 'https://hook.us1.make.com/ia2pkj63hrc4jy4lco0efyqlyukydm47',
              parameters: {
                type: 'object',
                required: ['callerNumber', 'callerName'],
                properties: {
                  callerName: {
                    type: 'string',
                    description: 'The name of the person receiving the SMS message.'
                  },
                  callerNumber: {
                    type: 'string',
                    description: 'The end user\'s phone number to be used with SMS messaging.'
                  }
                }
              },
              description: 'Sends requested info to the caller\'s phone number',
              serverUrlSecret: '777333777'
            },
            {
              name: 'addEventInquiry',
              async: false,
              serverUrl: 'https://hook.us1.make.com/ogr5fl5qpry9nn1e5h7ud9h0wemlb9p1',
              description: 'This function allows the user to add a tentative event date to our calendar as an inquiry to be reviewed by the M10 staff.',
              parameters: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the customer that is booking the event.'
                  },
                  event_date_and_time: {
                    type: 'string',
                    description: 'The date and time of the event or party in ISO 8601 format. The event date will always be in the future and never before the current date and time.'
                  },
                  eventType: {
                    type: 'string',
                    description: 'The type of event the user would like to book a DJ for.'
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'The phone number of the customer making the inquiry.'
                  }
                },
                required: ['name', 'eventType', 'phoneNumber', 'event_date_and_time']
              }
            },
            {
              name: 'captureContact',
              async: false,
              serverUrl: 'https://hook.us1.make.com/4dvxlg88eqla8dii9v3fyqrbuhtm3oja',
              description: 'This function allows the user to capture contact information including First Name, Last Name, Email Address, and Phone Number, and save it to the leads database.',
              parameters: {
                type: 'object',
                properties: {
                  FirstName: {
                    type: 'string',
                    description: 'The first name of the contact.'
                  },
                  LastName: {
                    type: 'string',
                    description: 'The last name of the contact.'
                  },
                  emailAddress: {
                    type: 'string',
                    description: 'The email address of the contact.'
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'The phone number of the contact.'
                  }
                },
                required: ['FirstName', 'LastName', 'emailAddress', 'phoneNumber']
              }
            }
          ],
          maxTokens: 250,
          temperature: 0.7
        },
        recordingEnabled: true,
        firstMessage: firstName ? `Hello ${firstName}, this is Ben's AI assistant. How can I help you today?` : `Hello, this is Ben's AI assistant. How can I help you today?`,
        voicemailMessage: 'You\'ve reached our voicemail. Please leave a message after the beep, and we\'ll get back to you as soon as possible.',
        endCallMessage: 'Thank you for contacting us. Have a great day!',
        transcriber: {
          model: 'general',
          language: 'en',
          provider: 'deepgram'
        },
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
        serverUrl: 'https://hook.us1.make.com/q7iyohghqrtholk87uzlfxpjsn12c13m',
        endCallPhrases: ['goodbye'],
        analysisPlan: {
          summaryPrompt: 'You are an expert note-taker. You will be given a transcript of a call. Summarize the call in 2-3 sentences, if applicable.',
          structuredDataPrompt: '## Key Performance Indicators (KPIs) for Support Call Success Evaluation\n\nTo effectively measure the success of our support calls, we focus on the following five critical KPIs. You will be given a transcript of a call and the system prompt of the Al participant.\n\n1. **First Call Resolution (FCR)**:\n   - **Notation**: Percentage (%)\n   - **Measurement**: High (≥ 80%) / Medium (60-79%) / Low (< 60%)\n   - **Importance**: Indicates the percentage of customer issues resolved on the first contact, reducing the need for follow-up calls. High FCR leads to increased customer satisfaction and reduced operational costs.\n\n2. **Customer Satisfaction (CSAT)**:\n   - **Notation**: Score (out of 10)\n   - **Measurement**: High (≥ 9/10) / Medium (7-8.9/10) / Low (< 7/10)\n   - **Importance**: Directly measures how satisfied customers are with the service they received. High CSAT scores reflect strong customer happiness and loyalty.\n\n3. **Average Handle Time (AHT)**:\n   - **Notation**: Optimal|Long|Short\n   - **Measurement**: Optimal (typically 4-6 minutes) / Long (> optimal range) / Short (< optimal range)\n   - **Importance**: Represents the average duration of a call, balancing efficiency and effectiveness. Optimal AHT ensures that issues are resolved efficiently without compromising quality.\n\n4. **Net Promoter Score (NPS)**:\n   - **Notation**: Score (range from -100 to 100)\n   - **Measurement**: High (≥ 50) / Medium (0-49) / Low (< 0)\n   - **Importance**: Gauges customer loyalty and their likelihood to recommend our company. A high NPS indicates strong customer relationships and potential for business growth.\n\n5. **Resolution Time (RT)**:\n   - **Notation**: Time (hours or days)\n   - **Measurement**: Fast (< 24 hours) / Moderate (24-48 hours) / Slow (> 48 hours)\n   - **Importance**: Tracks the total time taken to resolve an issue from the first contact. Faster resolution times typically lead to higher customer satisfaction and lower operational costs.',
          structuredDataSchema: {
            type: 'object',
            properties: {
              RT: {
                description: 'Tracks the total time taken to resolve an issue from the first contact. Faster resolution times typically lead to higher customer satisfaction and lower operational costs.',
                type: 'string'
              },
              AHT: {
                description: 'Represents the average duration of a call, balancing efficiency and effectiveness. Optimal AHT ensures that issues are resolved efficiently without compromising quality.',
                type: 'string'
              },
              FCR: {
                description: 'Indicates the percentage of customer issues resolved on the first contact, reducing the need for follow-up calls. High FCR leads to increased customer satisfaction and reduced operational costs.',
                type: 'string'
              },
              NPS: {
                description: 'Gauges customer loyalty and their likelihood to recommend our company. A high NPS indicates strong customer relationships and potential for business growth.',
                type: 'string'
              },
              CSAT: {
                description: 'Directly measures how satisfied customers are with the service they received. High CSAT scores reflect strong customer happiness and loyalty.',
                type: 'string'
              }
            }
          },
          successEvaluationPrompt: 'You are an expert call evaluator. You will be given a transcript of a call and the system prompt of the Al participant. Based on the objectives inferred from the system prompt, determine if the call was successful. **Goal:** To inform potential and customers about M10 DJ Company and the services we provide and answer any questions related to the business. The secondary goal is to send pricing info, consultation schedule links, and to put event inquiries on our calendar.',
          successEvaluationRubric: 'PassFail'
        },
        hipaaEnabled: false,
        maxDurationSeconds: 793,
        voicemailDetectionEnabled: false,
        backgroundSound: 'office'
      }
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
