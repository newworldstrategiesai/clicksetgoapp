'use client';

import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl || '/dashboard');
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl || '/dashboard');
  }
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  // Prevent default form submission refresh
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).trim() as Provider;

  // Create client-side supabase client and call signInWithOAuth
  const supabase = createClient();
  const redirectURL = getURL('/auth/callback');
  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectURL
    }
  });
}

export async function saveApiKeys(formData: FormData): Promise<string> {
  const twilioSid = formData.get('twilioSid') as string;
  const twilioAuthToken = formData.get('twilioAuthToken') as string;
  const elevenLabsKey = formData.get('elevenLabsKey') as string;
  const vapiKey = formData.get('vapiKey') as string;
  const userId = formData.get('user_id') as string;

  try {
    const response = await fetch('/api/save-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        twilioSid,
        twilioAuthToken,
        elevenLabsKey,
        vapiKey,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from API:', errorData);
      throw new Error('Failed to save API keys');
    }

    return '/account';  // Redirect URL after successful save
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw new Error('Failed to save API keys');
  }
}
