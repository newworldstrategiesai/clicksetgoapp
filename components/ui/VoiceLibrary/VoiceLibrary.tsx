// components/ui/VoiceLibrary.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button/Button';
import axios from 'axios';
import '../../modernSlider.css';
import AddVoiceModal from './AddVoiceModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    // Ensure 'preview_url' is part of the response
    return response.data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      gender: voice.gender,
      accent: voice.accent,
      preview_url: voice.preview_url || '', // Handle missing 'preview_url'
    }));
  } catch (error: any) {
    console.error('Failed to fetch voices:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail?.message || 'Failed to fetch voices');
  }
};

const VoiceLibrary: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAndSetVoices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const voicesData = await fetchVoices(apiKey);
      setVoices(voicesData);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchAndSetVoices();
  }, [fetchAndSetVoices]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    fetchAndSetVoices(); // Refresh voices after adding a new one
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold mb-4 dark:text-white">Voice Library</h1>
        <Button onClick={openModal} className="mb-4">
          Add Voice
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-screen overflow-y-auto mt-4 scrollable-element">
        {voices.map((voice) => (
          <div key={voice.voice_id} className="bg-modal dark:bg-gray-800 p-4 rounded-md shadow-md transition-all hover:shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium dark:text-white">{voice.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{voice.voice_id}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 dark:text-gray-300">{voice.gender || 'Unknown'} | {voice.accent || 'Unknown'}</span>
            </div>
            <div className="flex items-center">
              {voice.preview_url ? (
                <audio controls className="w-full">
                  <source src={voice.preview_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p className="text-gray-400">Preview not available.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <AddVoiceModal isOpen={isModalOpen} onClose={closeModal} apiKey={apiKey} />
      {isRefreshing && <p className="text-gray-400 mt-4">Refreshing voices...</p>}
    </div>
  );
};

export default VoiceLibrary;
