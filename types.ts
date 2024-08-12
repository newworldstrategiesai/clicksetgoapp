// types.ts

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