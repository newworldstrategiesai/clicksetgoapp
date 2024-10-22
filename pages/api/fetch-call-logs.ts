import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage } from 'http'; // Import IncomingMessage from 'http'

// URL of the API endpoint for a production server (using HTTPS)
const apiUrl = `${process.env.VERCEL_API}/api/fetch-call-logs`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Make a request to the API endpoint
  https.get(apiUrl, (response: IncomingMessage) => {
    let data = '';

    // A chunk of data has been received
    response.on('data', (chunk: string) => {
      data += chunk;
    });

    // The whole response has been received
    response.on('end', () => {
      console.log('Response from API:', data);
      res.status(200).json(JSON.parse(data)); // Respond with the parsed JSON data
    });

  }).on('error', (err: Error) => {
    console.error('Error making request:', err.message);
    res.status(500).json({ error: 'Error fetching call logs' });
  });
}
