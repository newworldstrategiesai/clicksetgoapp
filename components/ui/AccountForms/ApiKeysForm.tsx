'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { saveApiKeys } from '@/utils/auth-helpers/client';

interface ApiKeysFormProps {
  userId: string; // Define the type for userId
}

export default function ApiKeysForm({ userId }: ApiKeysFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      await saveApiKeys(formData);
      // Redirect or do something after successful save
    } catch (error) {
      console.error('Failed to save API keys:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="twilioSid" className="block text-sm font-medium text-gray-700">
          Twilio Account SID
        </label>
        <input
          type="text"
          name="twilioSid"
          id="twilioSid"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700">
          Twilio Auth Token
        </label>
        <input
          type="text"
          name="twilioAuthToken"
          id="twilioAuthToken"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="elevenLabsKey" className="block text-sm font-medium text-gray-700">
          ElevenLabs API Key
        </label>
        <input
          type="text"
          name="elevenLabsKey"
          id="elevenLabsKey"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="vapiKey" className="block text-sm font-medium text-gray-700">
          VAPI Key
        </label>
        <input
          type="text"
          name="vapiKey"
          id="vapiKey"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <Button type="submit" loading={isSubmitting}>
        Save API Keys
      </Button>
    </form>
  );
}
