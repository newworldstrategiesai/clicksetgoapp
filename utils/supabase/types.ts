// utils/supabase/types.ts
export type CallReport = {
    call_id: string;
    org_id: string;
    type: string;
    status: string;
    ended_reason: string;
    transcript: string;
    summary: string;
    messages: string[];
    analysis: string;
    recording_url: string;
    stereo_recording_url: string;
    customer_number: string;
    assistant_name: string;
    assistant_model: string;
    assistant_transcriber: string;
    assistant_voice_provider: string;
    assistant_voice_id: string;
    phone_number: string;
    timestamp: string;
    created_at?: string;
  };
  
  

  // utils/supabase/types.ts
export type Contact = {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email_address?: string; // Make email_address optional
    linkedin?: string;
    position?: string;
    company?: string;
    company_phone?: string;
    website?: string;
    domain?: string;
    facebook?: string;
    twitter?: string;
    linkedin_company_page?: string;
    country?: string;
    state?: string;
    vertical?: string;
    sub_category?: string;
    notes?: string;
    user_id: string;
  };
  