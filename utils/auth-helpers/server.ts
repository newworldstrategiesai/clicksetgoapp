'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getURL, getErrorRedirect, getStatusRedirect } from 'utils/helpers';
import { getAuthTypes } from 'utils/auth-helpers/settings';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      pathName,
      'Hmm... Something went wrong.',
      'You could not be signed out.'
    );
  }

  return '/signin';
}

export async function signInWithEmail(formData: FormData) {
  const cookieStore = cookies();
  const callbackURL = getURL('/auth/callback');

  const email = String(formData.get('email')).trim();

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/signin/email_signin',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();
  let options = {
    emailRedirectTo: callbackURL,
    shouldCreateUser: true
  };

  // If allowPassword is false, do not create a new user
  const { allowPassword } = getAuthTypes();
  if (allowPassword) options.shouldCreateUser = false;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: options
  });

  if (error) {
    return getErrorRedirect(
      '/signin/email_signin',
      'You could not be signed in.',
      error.message
    );
  }

  cookieStore.set('preferredSignInView', 'email_signin', { path: '/' });
  return getStatusRedirect(
    '/signin/email_signin',
    'Success!',
    'Please check your email for a magic link. You may now close this tab.',
    true
  );
}

export async function requestPasswordUpdate(formData: FormData) {
  const callbackURL = getURL('/auth/reset_password');

  // Get form data
  const email = String(formData.get('email')).trim();

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/signin/forgot_password',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackURL
  });

  if (error) {
    return getErrorRedirect(
      '/signin/forgot_password',
      error.message,
      'Please try again.'
    );
  }

  return getStatusRedirect(
    '/signin/forgot_password',
    'Success!',
    'Please check your email for a password reset link. You may now close this tab.',
    true
  );
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();

  const supabase = createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return getErrorRedirect(
      '/signin/password_signin',
      'Sign in failed.',
      error.message
    );
  }

  cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
  return redirect('/overview'); // Redirect to overview after sign-in
}

export async function signUp(formData: FormData) {
  const callbackURL = getURL('/auth/callback');

  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/signin/signup',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL
    }
  });

  if (error) {
    return getErrorRedirect(
      '/signin/signup',
      'Sign up failed.',
      error.message
    );
  }

  if (data.session) {
    return getStatusRedirect('/', 'Success!', 'You are now signed in.');
  }

  if (data.user && data.user.identities && data.user.identities.length == 0) {
    return getErrorRedirect(
      '/signin/signup',
      'Sign up failed.',
      'There is already an account associated with this email address. Try resetting your password.'
    );
  }

  return getStatusRedirect(
    '/',
    'Success!',
    'Please check your email for a confirmation link. You may now close this tab.'
  );
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password')).trim();
  const passwordConfirm = String(formData.get('passwordConfirm')).trim();

  // Check that the password and confirmation match
  if (password !== passwordConfirm) {
    return getErrorRedirect(
      '/signin/update_password',
      'Your password could not be updated.',
      'Passwords do not match.'
    );
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    return getErrorRedirect(
      '/signin/update_password',
      'Your password could not be updated.',
      error.message
    );
  }

  return getStatusRedirect(
    '/',
    'Success!',
    'Your password has been updated.'
  );
}

export async function updateEmail(formData: FormData) {
  // Get form data
  const newEmail = String(formData.get('newEmail')).trim();

  // Check that the email is valid
  if (!isValidEmail(newEmail)) {
    return getErrorRedirect(
      '/account',
      'Your email could not be updated.',
      'Invalid email address.'
    );
  }

  const supabase = createClient();

  const callbackUrl = getURL(
    getStatusRedirect('/account', 'Success!', `Your email has been updated.`)
  );

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: callbackUrl
    }
  );

  if (error) {
    return getErrorRedirect(
      '/account',
      'Your email could not be updated.',
      error.message
    );
  }

  return getStatusRedirect(
    '/account',
    'Confirmation emails sent.',
    `You will need to confirm the update by clicking the links sent to both the old and new email addresses.`
  );
}

export async function updateName(formData: FormData) {
  // Get form data
  const fullName = String(formData.get('fullName')).trim();

  const supabase = createClient();
  const { error, data } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });

  if (error) {
    return getErrorRedirect(
      '/account',
      'Your name could not be updated.',
      error.message
    );
  }

  return getStatusRedirect(
    '/account',
    'Success!',
    'Your name has been updated.'
  );
}
