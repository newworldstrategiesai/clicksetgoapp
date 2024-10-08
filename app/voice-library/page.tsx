'use client';

import React, { useState, useEffect } from 'react';
import VoiceLibrary from '@/components/ui/VoiceLibrary/VoiceLibrary'; // Adjust the import path as needed
import AddVoiceModal from '@/components/ui/VoiceLibrary/AddVoiceModal';
import { createClient } from '@/utils/supabase/client';

const VoicePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('api_keys' as any)  // Use 'any' assertion to bypass the type check
        .select('eleven_labs_key')
        .single();
      if (!error && data) {
        setApiKey(data.eleven_labs_key);
      } else {
        console.error("Error fetching API key:", error?.message);
      }
    };
    fetchApiKey();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-4 pt-20 md:pt-24 lg:pt-28"> {/* Added padding top */}
      {apiKey ? (
        <>
          <VoiceLibrary apiKey={apiKey} />
          <button onClick={openModal} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
            Add Voice
          </button>
          <AddVoiceModal isOpen={isModalOpen} onClose={closeModal} apiKey={apiKey} />
        </>
      ) : (
        <p>Loading API Key...</p>
      )}
    </div>
  );
};

export default VoicePage;
