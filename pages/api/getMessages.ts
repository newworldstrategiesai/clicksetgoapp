import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Message {
  role: 'bot' | 'user' | 'system';
  message: string;
  time: number;
  endTime: number;
  secondsFromStart: number;
  duration: number;
}

interface Data {
  messages: Message[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { callId } = req.query;

  // Validate the callId to ensure it's a string
  if (typeof callId === 'string' && callId.trim() !== '') {
    try {
      // Assuming the JSON file is inside the public/data folder
      const filePath = path.join(process.cwd(), 'public/data/vapilog.json'); // Adjust path if needed
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // Parse the JSON file
      const jsonData = JSON.parse(fileContents);

      // Find the correct call object using the callId
      const call = jsonData.find((call: { id: string }) => call.id === callId);

      // If the callId matches, return the messages associated with it
      if (call && call.messages) {
        return res.status(200).json({ messages: call.messages });
      } else {
        return res.status(404).json({ messages: [] }); // Return empty if not found
      }
    } catch (error) {
      console.error('Error reading the file:', error);
      return res.status(500).json({ messages: [] });
    }
  } else {
    // If callId is invalid or missing, return an error message
    return res.status(400).json({ messages: [] });
  }
}
