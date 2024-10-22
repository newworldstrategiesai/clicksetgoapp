import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = 'https://aawlzambxvdmwiwwhlqg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = 'cliquecamp@gmail.com';

async function resendVerificationEmail() {
  try {
    const response = await fetch(`aawlzambxvdmwiwwhlqg/auth/v1/admin/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        action: 'confirm'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending verification email:', errorText);
    } else {
      const result = await response.json();
      console.log('Verification email sent:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

resendVerificationEmail();
