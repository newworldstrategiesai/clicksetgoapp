// types/vapiTypes.ts

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
    llmPromptTokens?: number;
    llmCompletionTokens?: number;
    ttsCharacters?: number;
    analysisCostBreakdown?: {
      summary?: number;
      summaryPromptTokens?: number;
      summaryCompletionTokens?: number;
      structuredData?: number;
      structuredDataPromptTokens?: number;
      structuredDataCompletionTokens?: number;
      successEvaluation?: number;
      successEvaluationPromptTokens?: number;
      successEvaluationCompletionTokens?: number;
    };
  };
  monitor: {
    listenUrl: string;
    controlUrl: string;
  };
  artifact?: Artifact;
  customer?: Customer;
  userId?: string;
}

export interface Artifact {
  messages: Array<{
    role: 'system' | 'bot' | 'user';
    message: string;
    time: number;
    endTime: number;
    secondsFromStart: number;
  }>;
  transcript?: string[];
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  videoRecordingUrl?: string;
  videoRecordingStartDelaySeconds?: number;
  messagesOpenAIFormatted?: Array<{
    role: string;
    // Add other properties if they exist
  }>;
}

export interface Customer {
  number: string;
  name?: string;
}
