// app/setup-api-key/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const SetupApiKeyPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/setup-api-key', { apiKey });
      if (response.status === 200) {
        router.push('/dashboard/overview');
      }
    } catch (err) {
      setError('Failed to set up API key. Please try again.');
    }
  };

  return (
    <div>
      <h1>Setup Your API Key</h1>
      <form onSubmit={handleSubmit}>
        <label>
          API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </label>
        <button type="submit">Save API Key</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SetupApiKeyPage;
