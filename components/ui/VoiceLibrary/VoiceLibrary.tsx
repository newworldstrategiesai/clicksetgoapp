'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import axios from 'axios';

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

const fetchVoices = async (apiKey: string): Promise<Voice[]> => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
    });
    return response.data.voices || [];
  } catch (error) {
    throw new Error('Failed to fetch voices');
  }
};

const VoiceLibrary = ({ apiKey }: { apiKey: string }) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voicesData = await fetchVoices(apiKey);
        setVoices(voicesData);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchData();
  }, [apiKey]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Voice Library</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-screen overflow-y-auto mt-4">
        {voices.map((voice) => (
          <div key={voice.voice_id} className="bg-gray-900 p-4 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-white">{voice.name}</span>
              <span className="text-sm text-gray-400">{voice.voice_id}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">{voice.gender || 'Unknown'} | {voice.accent || 'Unknown'}</span>
            </div>
            <div className="flex items-center">
              <audio controls className="w-full">
                <source src={voice.preview_url} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceLibrary;
