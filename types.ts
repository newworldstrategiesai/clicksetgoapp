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
  