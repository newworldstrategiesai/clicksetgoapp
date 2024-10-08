// components/ui/AuthForms/PasswordSignin.tsx
'use client';

import  Button  from '@/components/ui/Button/Button'; // Changed to named import
import Link from 'next/link';
import { signInWithPassword } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true); // Disable the button while the request is being handled

    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false); // Re-enable button after request
  };

  return (
    <div className="my-8 pt-8"> {/* Added padding-top here */}
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email} // Controlled input
              onChange={(e) => setEmail(e.target.value)} // Update state on change
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full p-3 rounded-md bg-zinc-800"
              required // Mark as required for form validation
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              value={password} // Controlled input
              onChange={(e) => setPassword(e.target.value)} // Update state on change
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full p-3 rounded-md bg-zinc-800"
              required // Mark as required for form validation
            />
          </div>
          <Button
            variant="slim"
            type="submit"
            className="mt-1"
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </div>
      </form>
      <p>
        <Link href="/signin/forgot_password" className="font-light text-sm">
          Forgot your password?
        </Link>
      </p>
      {allowEmail && (
        <p>
          <Link href="/signin/email_signin" className="font-light text-sm">
            Sign in via magic link
          </Link>
        </p>
      )}
      <p>
        <Link href="/signin/signup" className="font-light text-sm">
          Don't have an account? Sign up
        </Link>
      </p>
    </div>
  );
}
