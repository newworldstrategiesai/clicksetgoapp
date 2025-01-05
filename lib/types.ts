// lib/types.ts

// **ParsedMessage Interface Definition**
export interface ParsedMessage {
  entities: Record<string, any>; // Replace 'any' with more specific types as needed
  sentiment?: "positive" | "neutral" | "negative";
  keywords?: string[];
  // Add other relevant properties based on your application's requirements
}

// **Communication Interface Definition**
export interface Communication {
  id: string;
  type: "Email" | "SMS" | "Facebook" | "Internal";
  clientId: string;
  content: string;
  subject?: string;
  from?: string;
  parsed?: ParsedMessage;
  starred?: boolean;
  createdAt: Date;
  channel: "twilio" | "facebook" | "internal";
  read?: boolean;
  metadata?: Record<string, any>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
}

export interface ChatThread {
  id: string;
  contactId: string;
  channel: "twilio" | "facebook" | "internal";
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "archived" | "spam";
  labels?: string[];
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  channel: "twilio" | "facebook" | "internal";
  read: boolean;
  status: "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, any>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  facebookId?: string;
  lastMessage?: ChatMessage;
  channel: "twilio" | "facebook" | "internal";
  unreadCount: number;
  status: "active" | "blocked" | "archived";
  tags?: string[];
  notes?: string;
  timezone?: string;
  lastActivity?: Date;
  metadata?: Record<string, any>;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  channel: "twilio" | "facebook" | "internal" | "all";
  category: "greeting" | "followup" | "support" | "marketing" | "custom";
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatNotification {
  id: string;
  threadId: string;
  type: "message" | "mention" | "reaction" | "status";
  content: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// **Database Types**
export interface Tables {
  agents: {
    id: string;
    user_id: string | null;
    agent_name: string;
    company_name: string;
    company_description: string | null;
    default_timezone: string | null;
    tone_of_voice: string | null;
    allow_emoji_usage: boolean | null;
    emoji_limit: string | null;
    message_length: string | null;
    multistep_instructions: string | null;
    ask_for_help: boolean | null;
    no_personal_info: boolean | null;
    no_competitors: boolean | null;
    vapi_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    default_voice: string | null;
    technical_skills: string | null;
    company_phone: string | null;
    company_website: string | null;
    role: string | null;
    active: boolean | null; // Added if not already present
    prompts: {
      greeting: string;
      fallback: string;
      closing: string;
    } | null; // Added
    personality: string; // Added
    useCase: string; // Added
    voiceId: string; // Added
  };

  contacts: {
    id: string;
    user_id: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email_address: string | null;
    created_at: string | null;
    linkedin: string | null;
    position: string | null;
    company: string | null;
    company_phone: string | null;
    website: string | null;
    domain: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin_company_page: string | null;
    country: string | null;
    state: string | null;
    vertical: string | null;
    sub_category: string | null;
    notes: string | null;
    conversation_count: number | null;
    last_contacted: string | null;
    messages_sent_count: number | null;
    messages_received_count: number | null;
    opt_in_status: boolean | null;
    preferred_language: string | null;
  };

  messages: {
    id: string;
    thread_id: string;
    content: string;
    sender_id: string;
    recipient_id: string;
    channel: string;
    status: string;
    metadata: Record<string, any> | null;
    created_at: string;
    read_at: string | null;
  };

  message_templates: {
    id: string;
    name: string;
    content: string;
    channel: string;
    category: string;
    variables: string[];
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
  };

  chat_threads: {
    id: string;
    contact_id: string;
    channel: string;
    status: string;
    labels: string[] | null;
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
  };
  
  notification_settings: {
    id: string;
    user_id: string;
    sms_enabled: boolean;
    email_enabled: boolean;
    notification_email: string | null;
    created_at: string;
    updated_at: string;
  };
  
  appointment_settings: {
    id: string;
    user_id: string;
    default_duration: number;
    break_time: number;
    calendar_connected: boolean;
    calendar_id: string | null;
    created_at: string;
    updated_at: string;
  };
}

// **Voice Agent Types**
export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  prompts: {
    greeting: string;
    fallback: string;
    closing: string;
  };
  personality: string;
  useCase: string;
  voiceId: string;
  createdAt: Date;
  updatedAt: Date;
  user_id: string | null;
}

// **CallLog Interface Definition**
export interface CallLog {
  id: string;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  status: "completed" | "failed" | "busy" | "no-answer" | "in-progress";
  duration: number;
  recordingUrl?: string;
  transcription?: string;
  createdAt: Date;
}

// **Client Interface Definition**
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  musicPreferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

// **VoiceConfig Interface Definition**
export interface VoiceConfig {
  defaultGreeting: string;
  voiceId: string;
  useCustomVoice: boolean;
  maxRecordingDuration?: number;
  transcribeRecordings?: boolean;
  notifyEmail?: string;
  notifySMS?: string;
}

// lib/types.ts

export interface Event {
  id: string;
  clientId: string; // Added
  type: string;
  location: string;
  date: Date;
  status: string;
  musicPreferences: string[]; // Added
  notes: string; // Added
  createdAt: Date;
  updatedAt: Date;
  // Add other relevant properties as needed
}


// **Lead Interface Definition**
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source?: string;
  status?: "new" | "contacted" | "qualified" | "lost";
  createdAt: Date;
  updatedAt: Date;
  // Add other relevant properties as needed
}

// **ColumnMeta Interface Definition**
export interface ColumnMeta {
  colSpan?: number;
  // Add other relevant properties as needed
}
