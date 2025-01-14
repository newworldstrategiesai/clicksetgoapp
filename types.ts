//@/types.ts
export interface CallLog {
  id: string;
  customer?: { number: string };
  type: string;
  status: string;
  startedAt: string;
  endedAt: string;
  duration: string;
  assistant?: { name: string };
  summary?: string;
  recordingUrl?: string;
  fullName: string;
  createdAt: string;
}

// app/dashboard/_components/types.ts

export interface ChartData {
  date: string;
  inbound: number;
  outbound: number;
}

export interface LineGraphProps {
  userId: string;
  vapiKey: string;
  onDataFetched?: (data: ChartData[]) => void;
}

export interface BarGraphProps {
  data: ChartData[];
}

export interface RecentCallsProps {
  userId: string;
  vapiKey: string;
}


export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

export interface List {
  id: string;
  name: string;
  contactsCount: number;
}

export interface TwilioNumber {
  id: string;
  number: string;
}

export interface SidebarLink {
  id: string; // Ensure this matches the type used everywhere
  name: string;
  phone: string;
  messages: any[]; // Define a more specific type if possible
  avatar?: string;
  variant: string;
}

export interface UserMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  dateSent: Date;
  contactName?: string;
  phone?: string;
  messages?: Message[]; // Use the Message interface here
  avatar?: string;
}

// New UserData interface
export interface UserData {
  id: string;
  name?: string; // This is optional since it may not be present in all cases
  avatar?: string; // This is optional since it may not be present in all cases
  phone?: string; // This is optional since it may not be present in all cases
  from: string;
  to?: string;
  messages?: Message[];
}

export interface Message {
  id: number;
  name: string;
  message: string;
  direction: string; // 'inbound' or 'outbound'
  dateSent: string;
  avatar?: string;
}

// Updated Campaign interface based on the provided schema
export interface Campaign {
  id: string; // UUID type corresponds to string in TypeScript
  name: string; // Text type
  description?: string; // Text type, optional
  start_date?: string; // Timestamp with time zone, optional
  end_date?: string; // Timestamp with time zone, optional
  status?: string; // Text type, optional
  created_at?: string; // Timestamp with time zone, optional
  updated_at?: string; // Timestamp with time zone, optional
  start_time?: string; // Time without time zone, optional
  start_timezone?: string; // Character varying, optional
  end_time?: string; // Time without time zone, optional
  end_timezone?: string; // Character varying, optional
  audience?: string; // UUID type corresponds to string in TypeScript, optional
  budget?: number; // Numeric type, optional
  allocation?: string; // Character varying, optional
  utm_source?: string; // Character varying, optional
  utm_medium?: string; // Character varying, optional
  utm_campaign?: string; // Character varying, optional
  gdpr?: boolean; // Boolean type, optional
  ccpa?: boolean; // Boolean type, optional
  channels?: any; // JSONB type, optional
  due_date?: string; // Timestamp with time zone, optional
  schedule?: string; // UUID type corresponds to string in TypeScript, optional
  user_id?: string; // UUID type corresponds to string in TypeScript, optional
  agent?: string; // UUID type corresponds to string in TypeScript, optional
  scheduled_at?: string; // Timestamp with time zone, optional
}


export interface DialerComponentProps {
  userId: string;
  apiKey: string;
  twilioSid: string;
  twilioAuthToken: string;
  vapiKey: string;
  agentName: string;
  role: string;
  companyName: string;
  prompt: string;
  voiceId: string;
}

export interface YourTaskType {
  id: string;
  campaign_id: string | null;
  campaign_name: string;
  call_subject: string;
  call_status: string;
  priority: number | null;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  contacts: Array<{
    first_name: string;
    last_name: string;
    phone: string;
  }>;
}
