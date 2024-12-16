'use client';

import { useState, useEffect } from 'react';
import { toast} from 'react-toastify';
import Button from '@/components/ui/Button/Button'; // Changed to default import
import Card from '@/components/ui/Card/Card';
import { saveApiKeys } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';
import 'react-toastify/dist/ReactToastify.css';

interface ApiKeysFormProps {
  userId: string;
  apiKeys: {
    twilio_sid: string | null;
    twilio_auth_token: string | null;
    eleven_labs_key: string | null;
    vapi_key: string | null;
    open_ai_api_key: string | null;
  } | null;
}

export default function ApiKeysForm({ userId, apiKeys }: ApiKeysFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    twilioSid: '',
    twilioAuthToken: '',
    elevenLabsKey: '',
    vapiKey: '',
    openAiApiKey: '',
  });

  useEffect(() => {
    if (apiKeys) {
      setFormValues({
        twilioSid: apiKeys.twilio_sid || '',
        twilioAuthToken: apiKeys.twilio_auth_token || '',
        elevenLabsKey: apiKeys.eleven_labs_key || '',
        vapiKey: apiKeys.vapi_key || '',
        openAiApiKey: apiKeys.open_ai_api_key || '',
      });
    }
  }, [apiKeys]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const result = await saveApiKeys(supabase, {
        userId,
        twilioSid: formValues.twilioSid,
        twilioAuthToken: formValues.twilioAuthToken,
        elevenLabsKey: formValues.elevenLabsKey,
        vapiKey: formValues.vapiKey,
        openAiApiKey: formValues.openAiApiKey,
      });

      if (result.success) {
        toast.success('API keys saved successfully!');
      } else {
        throw new Error('Unknown error occurred during saving.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during API key save:', error);
        toast.error(`Failed to save API keys: ${error.message}`);
      } else {
        console.error('Unexpected error:', error);
        toast.error('Failed to save API keys: An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title="API Keys"
      description="Manage your API keys for Twilio, ElevenLabs, VAPI, and OpenAI."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="twilioSid" className="block text-sm font-medium dark:text-white">
            Twilio Account SID
          </label>
          <input
            type="text"
            name="twilioSid"
            id="twilioSid"
            value={formValues.twilioSid}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent dark:text-white"
            
          />
        </div>
        <div>
          <label htmlFor="twilioAuthToken" className="block text-sm font-medium dark:text-white">
            Twilio Auth Token
          </label>
          <input
            type="text"
            name="twilioAuthToken"
            id="twilioAuthToken"
            value={formValues.twilioAuthToken}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent dark:text-white"
            
          />
        </div>
        <div>
          <label htmlFor="elevenLabsKey" className="block text-sm font-medium dark:text-white">
            ElevenLabs API Key
          </label>
          <input
            type="text"
            name="elevenLabsKey"
            id="elevenLabsKey"
            value={formValues.elevenLabsKey}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent dark:text-white"
            
          />
        </div>
        <div>
          <label htmlFor="vapiKey" className="block text-sm font-medium dark:text-white">
            VAPI Key
          </label>
          <input
            type="text"
            name="vapiKey"
            id="vapiKey"
            value={formValues.vapiKey}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent dark:text-white"
            
          />
        </div>
        <div>
          <label htmlFor="openAiApiKey" className="block text-sm font-medium dark:text-white">
            OpenAI API Key
          </label>
          <input
            type="text"
            name="openAiApiKey"
            id="openAiApiKey"
            value={formValues.openAiApiKey}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-transparent dark:text-white"
            
          />
        </div>
        <div>
          <Button type="submit" 
          className=' hover:text-white dark:hover:text-white'
          disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save API Keys'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
