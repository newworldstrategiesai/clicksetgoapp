// pages/api/getVoices.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Voice[] | { message: string }>) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    res.status(500).json({ message: 'Server configuration error: API key missing.' });
    return;
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
    });

    const voices: Voice[] = response.data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      gender: voice.gender || 'Unknown',
      accent: voice.accent || 'Unknown',
      preview_url: voice.preview_url || '', // Ensure 'preview_url' is present
    }));

    res.status(200).json(voices);
  } catch (error: any) {
    console.error('Error fetching voices:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: error.response?.data?.detail?.message || 'Failed to fetch voices.' });
  }
};

export default handler;
