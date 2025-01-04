import { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';  // Use twiml for older versions of Twilio
const { MessagingResponse } = twiml;

// Endpoint to handle incoming SMS
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Extract the message content and sender number from the incoming request
    const { Body, From } = req.body;

    // Log incoming message and sender number
    console.log(`Received message: ${Body} from ${From}`);

    // Generate TwiML response to reply to the incoming message
    const twimlResponse = new MessagingResponse();
    
    // Respond with a message
    twimlResponse.message(`Thanks for your message! You said: ${Body}`);

    // Send the TwiML response to Twilio
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twimlResponse.toString());
  } else {
    // If the method is not POST, send an error response
    res.status(405).send('Method Not Allowed');
  }
}
