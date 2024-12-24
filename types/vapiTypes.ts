export interface VapiResponse {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  status: string;
  endedReason?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: {
    transport: number;
    stt: number;
    llm: number;
    tts: number;
    vapi: number;
    total: number;
  };
  monitor: {
    listenUrl: string;
    controlUrl: string;
  };
  artifact?: {
    messages: Array<{
      role: 'system' | 'bot' | 'user'; // Enforced role types
      message: string;
      time: number;
      endTime: number;
      secondsFromStart: number;
    }>;
    transcript?: string[]; // Changed to an array of strings
  };
  customer?: { // Add the customer property as optional
    number: string;
    name?: string; // Name is optional
  };
  userId?: string; // Add the `userId` property here
}
