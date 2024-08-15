'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card/Card';
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
    <Card
      title="API Keys"
      description="Manage your API keys for Twilio, ElevenLabs, and VAPI."
      footer={
        <Button type="submit" loading={isSubmitting}>
          Save API Keys
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="twilioSid" className="block text-sm font-medium text-white">
            Twilio Account SID
          </label>
          <input
            type="text"
            name="twilioSid"
            id="twilioSid"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-white">
            Twilio Auth Token
          </label>
          <input
            type="text"
            name="twilioAuthToken"
            id="twilioAuthToken"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="elevenLabsKey" className="block text-sm font-medium text-white">
            ElevenLabs API Key
          </label>
          <input
            type="text"
            name="elevenLabsKey"
            id="elevenLabsKey"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="vapiKey" className="block text-sm font-medium text-white">
            VAPI Key
          </label>
          <input
            type="text"
            name="vapiKey"
            id="vapiKey"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent text-white"
            required
          />
        </div>
      </form>
    </Card>
  );
}
