//lib/config.ts
export const config = {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Click Set Go',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@clicksetgodj.com',
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
    twilioPhone: process.env.NEXT_PUBLIC_TWILIO_PHONE || '+1234567890',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    vapiApiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY || '0adbf7a0-ffa1-45f7-a03d-8c14972f9b5b',
    twilioAccountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || 'AC0dce2744a9d1f269bd047e59f0141c1c',
    twilioAuthToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '10a9c156f0662aa2cf73fc4ce02f6ef3',
    elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 'sk_6001ec44bb9b30714cab407a936246fe1768bad350f225b2',
    openAiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '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',
  };