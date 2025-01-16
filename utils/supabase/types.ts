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

// utils/supabase/types.ts

export type CompanyLink = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};



export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          user_id: string;
          agent_name: string;
          company_name: string;
          company_description: string;
          default_timezone: string;
          tone_of_voice: string;
          allow_emoji_usage: boolean;
          emoji_limit: string;
          message_length: string;
          multistep_instructions: string;
          ask_for_help: boolean;
          no_personal_info: boolean;
          no_competitors: boolean;
          vapi_id: string;
          created_at: string;
          updated_at: string;
          default_voice: string;
          technical_skills: string;
          company_phone: string;
          company_website: string;
          role: string;
        };
        Insert: Partial<{
          id: string;
          user_id: string;
          agent_name: string;
          company_name: string;
          company_description: string;
          default_timezone: string;
          tone_of_voice: string;
          allow_emoji_usage: boolean;
          emoji_limit: string;
          message_length: string;
          multistep_instructions: string;
          ask_for_help: boolean;
          no_personal_info: boolean;
          no_competitors: boolean;
          vapi_id: string;
          default_voice: string;
          technical_skills: string;
          company_phone: string;
          company_website: string;
          role: string;
        }>;
        Update: Partial<{
          company_name: string;
          company_description: string;
          company_website: string;
          company_phone: string;
        }>;
      };
      company_links: {
        Row: CompanyLink;
        Insert: Partial<CompanyLink>;
        Update: Partial<CompanyLink>;
      };
      // Define other tables as needed
    };
  };
};





export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  website: string;
  owner_id: string;
  phone?: string; // Optional if phone can be null
  created_at: string;
  updated_at: string;
}
