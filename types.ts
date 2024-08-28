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
